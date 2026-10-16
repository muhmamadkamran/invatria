-- Cloud-only ownership: hosts must have a registered, confirmed email account.
-- Guests still read published invitations and submit replies via submit-response.

create or replace function public.has_registered_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = (select auth.uid())
      and not coalesce(u.is_anonymous, false)
      and nullif(u.email, '') is not null
      and u.email_confirmed_at is not null
  );
$$;

revoke all on function public.has_registered_account() from public;
grant execute on function public.has_registered_account() to authenticated;

drop policy if exists "owners create their own invitations" on public.invitations;
create policy "owners create their own invitations"
  on public.invitations for insert to authenticated
  with check (
    (select public.has_registered_account())
    and owner_id = (select auth.uid())
  );

drop policy if exists "owners update their own invitations" on public.invitations;
create policy "owners update their own invitations"
  on public.invitations for update to authenticated
  using (
    (select public.has_registered_account())
    and owner_id = (select auth.uid())
  )
  with check (
    (select public.has_registered_account())
    and owner_id = (select auth.uid())
  );

drop policy if exists "owners delete their own invitations" on public.invitations;
create policy "owners delete their own invitations"
  on public.invitations for delete to authenticated
  using (
    (select public.has_registered_account())
    and owner_id = (select auth.uid())
  );

drop policy if exists "hosts delete their own replies" on public.rsvps;
create policy "hosts delete their own replies"
  on public.rsvps for delete to authenticated
  using (
    (select public.has_registered_account())
    and exists (
      select 1 from public.invitations i
      where i.id = rsvps.invitation_id and i.owner_id = (select auth.uid())
    )
  );

drop policy if exists "hosts moderate their guest book" on public.guest_messages;
create policy "hosts moderate their guest book"
  on public.guest_messages for update to authenticated
  using (
    (select public.has_registered_account())
    and exists (
      select 1 from public.invitations i
      where i.id = guest_messages.invitation_id and i.owner_id = (select auth.uid())
    )
  )
  with check (
    (select public.has_registered_account())
    and exists (
      select 1 from public.invitations i
      where i.id = guest_messages.invitation_id and i.owner_id = (select auth.uid())
    )
  );

drop policy if exists "hosts delete guest book notes" on public.guest_messages;
create policy "hosts delete guest book notes"
  on public.guest_messages for delete to authenticated
  using (
    (select public.has_registered_account())
    and exists (
      select 1 from public.invitations i
      where i.id = guest_messages.invitation_id and i.owner_id = (select auth.uid())
    )
  );

drop policy if exists "owners upload into their own folder" on storage.objects;
create policy "owners upload into their own folder"
  on storage.objects for insert to authenticated
  with check (
    (select public.has_registered_account())
    and bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "owners replace their own media" on storage.objects;
create policy "owners replace their own media"
  on storage.objects for update to authenticated
  using (
    (select public.has_registered_account())
    and bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    (select public.has_registered_account())
    and bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "owners delete their own media" on storage.objects;
create policy "owners delete their own media"
  on storage.objects for delete to authenticated
  using (
    (select public.has_registered_account())
    and bucket_id in ('covers', 'galleries', 'audio')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Subscriptions need explicit publication membership in addition to RLS.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'guest_messages'
    ) then
      alter publication supabase_realtime add table public.guest_messages;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rsvps'
    ) then
      alter publication supabase_realtime add table public.rsvps;
    end if;
  end if;
end;
$$;
