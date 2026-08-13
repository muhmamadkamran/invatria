-- ============================================================================
-- Invitra — initial schema
--
-- Access model, in one paragraph:
--   * A published invitation is world-readable — that is the whole point of a
--     shareable link, and guests never sign in.
--   * Only the owner may write to their own invitation, or read its replies.
--   * Guests may create RSVPs and guest-book notes, but never read the reply
--     list. Those inserts go through the `submit-response` Edge Function so
--     they can be rate limited and captcha-checked; anon has no direct INSERT.
--   * Ownership is an anonymous auth user, so "no account needed" still holds.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- invitations
--
-- The body stays as jsonb: it is genuinely one nested document (timeline,
-- story chapters, FAQs, dress code) and the app already treats it that way.
-- Only the fields we filter, sort or join on are promoted to real columns.
-- ---------------------------------------------------------------------------
create table if not exists public.invitations (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null,
  owner_id     uuid not null references auth.users (id) on delete cascade,
  published    boolean not null default false,
  template_id  text not null,
  category     text not null,
  language     text not null default 'en',
  data         jsonb not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint invitations_slug_format
    check (slug ~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$')
);

-- Slugs are the public address of an invitation, so they must be globally
-- unique — case-insensitively, because links get typed by hand.
create unique index if not exists invitations_slug_key
  on public.invitations (lower(slug));

create index if not exists invitations_owner_idx
  on public.invitations (owner_id, updated_at desc);

create index if not exists invitations_published_idx
  on public.invitations (published) where published;

-- ---------------------------------------------------------------------------
-- rsvps
-- ---------------------------------------------------------------------------
create table if not exists public.rsvps (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 120),
  email          text check (email is null or char_length(email) <= 254),
  status         text not null check (status in ('attending', 'not-attending', 'maybe')),
  guests         integer not null default 1 check (guests between 0 and 50),
  meal           text check (meal is null or char_length(meal) <= 120),
  message        text check (message is null or char_length(message) <= 2000),
  created_at     timestamptz not null default now()
);

create index if not exists rsvps_invitation_idx
  on public.rsvps (invitation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- guest_messages
-- ---------------------------------------------------------------------------
create table if not exists public.guest_messages (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 120),
  message        text not null check (char_length(message) between 1 and 2000),
  hidden         boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists guest_messages_invitation_idx
  on public.guest_messages (invitation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- rate_limits — backing store for the Edge Function's throttle
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  bucket       text primary key,
  hits         integer not null default 0,
  window_start timestamptz not null default now()
);

-- ============================================================================
-- Triggers
-- ============================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists invitations_touch_updated_at on public.invitations;
create trigger invitations_touch_updated_at
  before update on public.invitations
  for each row execute function public.touch_updated_at();

-- An invitation must always belong to the caller. Forcing owner_id in a
-- trigger means the client cannot spoof it even if it sends the column.
create or replace function public.set_owner()
returns trigger
language plpgsql
as $$
begin
  new.owner_id = auth.uid();
  return new;
end;
$$;

drop trigger if exists invitations_set_owner on public.invitations;
create trigger invitations_set_owner
  before insert on public.invitations
  for each row execute function public.set_owner();

-- ============================================================================
-- Row level security
-- ============================================================================

alter table public.invitations    enable row level security;
alter table public.rsvps          enable row level security;
alter table public.guest_messages enable row level security;
alter table public.rate_limits    enable row level security;

-- --- invitations -----------------------------------------------------------

drop policy if exists "published invitations are readable by anyone" on public.invitations;
create policy "published invitations are readable by anyone"
  on public.invitations for select
  using (published or owner_id = (select auth.uid()));

drop policy if exists "owners create their own invitations" on public.invitations;
create policy "owners create their own invitations"
  on public.invitations for insert to authenticated
  with check (true);  -- owner_id is forced by the set_owner trigger

drop policy if exists "owners update their own invitations" on public.invitations;
create policy "owners update their own invitations"
  on public.invitations for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists "owners delete their own invitations" on public.invitations;
create policy "owners delete their own invitations"
  on public.invitations for delete to authenticated
  using (owner_id = (select auth.uid()));

-- --- rsvps -----------------------------------------------------------------
-- Deliberately no INSERT policy for anon/authenticated: replies arrive through
-- the Edge Function, which holds the service-role key and applies throttling.

drop policy if exists "hosts read their own replies" on public.rsvps;
create policy "hosts read their own replies"
  on public.rsvps for select to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = rsvps.invitation_id and i.owner_id = (select auth.uid())
  ));

drop policy if exists "hosts delete their own replies" on public.rsvps;
create policy "hosts delete their own replies"
  on public.rsvps for delete to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = rsvps.invitation_id and i.owner_id = (select auth.uid())
  ));

-- --- guest_messages --------------------------------------------------------
-- The guest book is public by nature: everyone reads it on the invitation.

drop policy if exists "guest book is readable by anyone" on public.guest_messages;
create policy "guest book is readable by anyone"
  on public.guest_messages for select
  using (
    not hidden
    and exists (
      select 1 from public.invitations i
      where i.id = guest_messages.invitation_id and i.published
    )
  );

drop policy if exists "hosts moderate their guest book" on public.guest_messages;
create policy "hosts moderate their guest book"
  on public.guest_messages for update to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = guest_messages.invitation_id and i.owner_id = (select auth.uid())
  ))
  with check (true);

drop policy if exists "hosts delete guest book notes" on public.guest_messages;
create policy "hosts delete guest book notes"
  on public.guest_messages for delete to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.id = guest_messages.invitation_id and i.owner_id = (select auth.uid())
  ));

-- rate_limits is service-role only; RLS on with no policies denies everyone else.

-- ============================================================================
-- RPCs
-- ============================================================================

-- Anon cannot SELECT unpublished rows, so a plain existence query would report
-- a taken slug as free. This answers the question without leaking anything.
create or replace function public.is_slug_available(candidate text, self_id uuid default null)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select not exists (
    select 1 from public.invitations
    where lower(slug) = lower(candidate)
      and (self_id is null or id <> self_id)
  );
$$;

-- The dashboard head count, done in the database rather than by pulling every
-- reply down to the browser.
create or replace function public.rsvp_summary(invitation uuid)
returns table (status text, replies bigint, heads bigint)
language sql
security invoker          -- RLS still applies: only the host sees their data
stable
as $$
  select r.status, count(*) as replies, coalesce(sum(r.guests), 0) as heads
  from public.rsvps r
  where r.invitation_id = invitation
  group by r.status;
$$;

grant execute on function public.is_slug_available(text, uuid) to anon, authenticated;
grant execute on function public.rsvp_summary(uuid)            to authenticated;

-- ============================================================================
-- Storage
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers',    'covers',    true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('galleries', 'galleries', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif','image/gif']),
  ('audio',     'audio',     true, 20971520, array['audio/mpeg','audio/mp4','audio/wav','audio/ogg','audio/x-m4a'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Media is world-readable (guests must see it) but each owner may only write
-- inside a folder named after their own user id.
drop policy if exists "invitra media is publicly readable" on storage.objects;
create policy "invitra media is publicly readable"
  on storage.objects for select
  using (bucket_id in ('covers', 'galleries', 'audio'));

drop policy if exists "owners upload into their own folder" on storage.objects;
create policy "owners upload into their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "owners replace their own media" on storage.objects;
create policy "owners replace their own media"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "owners delete their own media" on storage.objects;
create policy "owners delete their own media"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
