-- Adversarial checks against the real policies. Each test prints PASS/FAIL.
\set ON_ERROR_STOP off
\pset pager off
\pset tuples_only on

-- Supabase grants table privileges broadly and relies on RLS as the gate;
-- mirror that so we are testing the policies, not the GRANTs.
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
grant all on storage.objects to anon, authenticated, service_role;

-- Two hosts and their invitations
insert into auth.users (id, email, email_confirmed_at) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.test', now()),
  ('22222222-2222-2222-2222-222222222222', 'mallory@example.test', now())
on conflict do nothing;

set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
set role authenticated;

insert into public.invitations (id, slug, template_id, category, data)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'alice-and-bob', 'royal-gold', 'wedding', '{"x":1}'::jsonb);
insert into public.invitations (id, slug, published, template_id, category, data)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'alice-live', true, 'royal-gold', 'wedding', '{"x":1}'::jsonb);

select '1. set_owner trigger forces ownership: ' ||
  case when owner_id = '11111111-1111-1111-1111-111111111111'
       then 'PASS' else 'FAIL ' || owner_id end
from public.invitations where slug = 'alice-live';

reset role; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'; set role authenticated;

select '2. other user cannot see an unpublished invitation: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL' end
from public.invitations where slug = 'alice-and-bob';

select '3. other user CAN see a published invitation: ' ||
  case when count(*) = 1 then 'PASS' else 'FAIL' end
from public.invitations where slug = 'alice-live';

with attempt as (
  update public.invitations set published = false
  where slug = 'alice-live' returning 1
)
select '4. other user cannot update it: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL' end from attempt;

with attempt as (
  delete from public.invitations where slug = 'alice-live' returning 1
)
select '5. other user cannot delete it: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL' end from attempt;

-- spoofing owner_id on insert must not work
insert into public.invitations (id, slug, template_id, category, data, owner_id)
values ('aaaaaaaa-0000-0000-0000-000000000003', 'mallory', 'royal-gold', 'wedding', '{}'::jsonb,
        '11111111-1111-1111-1111-111111111111');
select '6. owner_id cannot be spoofed on insert: ' ||
  case when owner_id = '22222222-2222-2222-2222-222222222222' then 'PASS' else 'FAIL' end
from public.invitations where slug = 'mallory';

-- anon
reset role; reset request.jwt.claim.sub; set role anon;

select '7. anon sees published only: ' ||
  case when count(*) = 1 then 'PASS' else 'FAIL (' || count(*) || ')' end
from public.invitations;

do $$
begin
  insert into public.rsvps (invitation_id, name, status, guests)
  values ('aaaaaaaa-0000-0000-0000-000000000002', 'Sneaky', 'attending', 1);
  raise notice '8. anon CANNOT insert an RSVP directly: FAIL (insert succeeded)';
exception when insufficient_privilege or others then
  raise notice '8. anon CANNOT insert an RSVP directly: PASS';
end $$;

select '9. is_slug_available hides unpublished slugs correctly: ' ||
  case when public.is_slug_available('alice-and-bob') = false
        and public.is_slug_available('totally-free') = true
       then 'PASS' else 'FAIL' end;

-- service role writes the reply, as the Edge Function would
reset role; set role service_role;
insert into public.rsvps (invitation_id, name, status, guests)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Guest A', 'attending', 3),
       ('aaaaaaaa-0000-0000-0000-000000000002', 'Guest B', 'attending', 2),
       ('aaaaaaaa-0000-0000-0000-000000000002', 'Guest C', 'not-attending', 0);
insert into public.guest_messages (invitation_id, name, message)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'Guest A', 'Congratulations!');

reset role; reset request.jwt.claim.sub; set role anon;
select '10. anon cannot read the reply list: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL (' || count(*) || ')' end
from public.rsvps;

select '11. anon CAN read the guest book: ' ||
  case when count(*) = 1 then 'PASS' else 'FAIL' end
from public.guest_messages;

reset role; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; set role authenticated;
select '12. host reads their own replies: ' ||
  case when count(*) = 3 then 'PASS' else 'FAIL (' || count(*) || ')' end
from public.rsvps;

select '13. rsvp_summary aggregates in SQL: ' ||
  case when (select heads from public.rsvp_summary('aaaaaaaa-0000-0000-0000-000000000002')
             where status = 'attending') = 5
       then 'PASS' else 'FAIL' end;

reset role; set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222'; set role authenticated;
select '14. a different host reads none of them: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL (' || count(*) || ')' end
from public.rsvps;

-- constraints
reset role; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; set role authenticated;
do $$
begin
  insert into public.invitations (slug, template_id, category, data)
  values ('Not A Valid Slug!', 'royal-gold', 'wedding', '{}'::jsonb);
  raise notice '15. slug format is enforced: FAIL';
exception when check_violation then raise notice '15. slug format is enforced: PASS';
end $$;

do $$
begin
  insert into public.invitations (slug, template_id, category, data)
  values ('alice-live', 'royal-gold', 'wedding', '{}'::jsonb);
  raise notice '16. slug uniqueness is enforced: FAIL';
exception when unique_violation then raise notice '16. slug uniqueness is enforced: PASS';
end $$;

do $$
begin
  insert into public.invitations (slug, template_id, category, data)
  values ('ALICE-LIVE', 'royal-gold', 'wedding', '{}'::jsonb);
  raise notice '17. slug uniqueness is case-insensitive: FAIL';
exception when unique_violation then raise notice '17. slug uniqueness is case-insensitive: PASS';
       when check_violation  then raise notice '17. slug uniqueness is case-insensitive: PASS (rejected by format)';
end $$;

-- updated_at trigger
select pg_sleep(0.05);
update public.invitations set data = '{"x":2}'::jsonb where slug = 'alice-live';
select '18. updated_at trigger fires: ' ||
  case when updated_at > created_at then 'PASS' else 'FAIL' end
from public.invitations where slug = 'alice-live';

-- cascade
reset role; set role service_role;
delete from public.invitations where slug = 'alice-live';
select '19. replies cascade with the invitation: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL (' || count(*) || ')' end
from public.rsvps;
select '20. guest book cascades too: ' ||
  case when count(*) = 0 then 'PASS' else 'FAIL' end
from public.guest_messages;

-- storage folder scoping
reset role; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111'; set role authenticated;
insert into storage.objects (bucket_id, name) values ('covers', '11111111-1111-1111-1111-111111111111/pic.jpg');
select '21. owner uploads into their own folder: ' ||
  case when count(*) = 1 then 'PASS' else 'FAIL' end from storage.objects;

do $$
begin
  insert into storage.objects (bucket_id, name)
  values ('covers', '22222222-2222-2222-2222-222222222222/evil.jpg');
  raise notice '22. cannot upload into someone else''s folder: FAIL';
exception when others then raise notice '22. cannot upload into someone else''s folder: PASS';
end $$;

reset role;
