-- Run after every migration as a database administrator on a test database.
-- Fail on the first broken assertion; all fixtures are rolled back.
\set ON_ERROR_STOP on
begin;

grant usage on schema public, auth, storage to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on storage.objects to anon, authenticated;

insert into auth.users (id, email, is_anonymous, email_confirmed_at) values
  ('99999999-0000-0000-0000-000000000001', 'host-a@example.test', false, now()),
  ('99999999-0000-0000-0000-000000000002', 'host-b@example.test', false, now()),
  ('99999999-0000-0000-0000-000000000003', null, true, null),
  ('99999999-0000-0000-0000-000000000004', 'unconfirmed@example.test', false, null);

set request.jwt.claim.sub = '99999999-0000-0000-0000-000000000003';
insert into public.invitations (id, slug, template_id, category, data)
values ('99999999-1000-0000-0000-000000000003', 'regression-legacy-anonymous', 'royal-gold', 'wedding', '{}');
insert into storage.objects (bucket_id, name)
values ('galleries', '99999999-0000-0000-0000-000000000003/legacy.png');

set role authenticated;
do $$
declare affected integer;
begin
  if public.has_registered_account() then
    raise exception 'Anonymous account was accepted as registered';
  end if;
  begin
    insert into public.invitations (slug, template_id, category, data)
    values ('regression-anonymous-draft', 'royal-gold', 'wedding', '{}');
    raise exception 'Anonymous draft insert succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.invitations (slug, published, template_id, category, data)
    values ('regression-anonymous-published', true, 'royal-gold', 'wedding', '{}');
    raise exception 'Anonymous publish insert succeeded';
  exception when insufficient_privilege then null;
  end;
  update public.invitations set published = true
  where id = '99999999-1000-0000-0000-000000000003';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Anonymous account published a legacy draft'; end if;
  delete from public.invitations where id = '99999999-1000-0000-0000-000000000003';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Anonymous account deleted a legacy draft'; end if;
  begin
    insert into storage.objects (bucket_id, name)
    values ('galleries', '99999999-0000-0000-0000-000000000003/new.png');
    raise exception 'Anonymous media upload succeeded';
  exception when insufficient_privilege then null;
  end;
  update storage.objects set name = '99999999-0000-0000-0000-000000000003/replaced.png'
  where name = '99999999-0000-0000-0000-000000000003/legacy.png';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Anonymous media replacement succeeded'; end if;
  delete from storage.objects where name = '99999999-0000-0000-0000-000000000003/legacy.png';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Anonymous media deletion succeeded'; end if;
end;
$$;

reset role;
set request.jwt.claim.sub = '99999999-0000-0000-0000-000000000004';
set role authenticated;
do $$
begin
  if public.has_registered_account() then raise exception 'Unconfirmed account was accepted'; end if;
  begin
    insert into public.invitations (slug, published, template_id, category, data)
    values ('regression-unconfirmed', true, 'royal-gold', 'wedding', '{}');
    raise exception 'Unconfirmed account published';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set request.jwt.claim.sub = '99999999-0000-0000-0000-000000000001';
set role authenticated;
do $$
begin
  if not public.has_registered_account() then raise exception 'Confirmed host was rejected'; end if;
end;
$$;
insert into public.invitations (id, slug, template_id, category, data)
values ('99999999-1000-0000-0000-000000000001', 'regression-host-a', 'royal-gold', 'wedding', '{}');
update public.invitations set published = true
where id = '99999999-1000-0000-0000-000000000001';
insert into public.invitations (id, slug, template_id, category, data)
values ('99999999-1000-0000-0000-000000000005', 'regression-host-a-private', 'royal-gold', 'wedding', '{}');
insert into storage.objects (bucket_id, name)
values ('galleries', '99999999-0000-0000-0000-000000000001/own.png');

reset role;
set request.jwt.claim.sub = '99999999-0000-0000-0000-000000000002';
set role authenticated;
insert into public.invitations (id, slug, published, template_id, category, data)
values ('99999999-1000-0000-0000-000000000002', 'regression-host-b', true, 'royal-gold', 'wedding', '{}');
do $$
declare affected integer;
begin
  update public.invitations set published = false
  where id = '99999999-1000-0000-0000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Host modified another account invitation'; end if;
  if exists (select 1 from public.invitations where id = '99999999-1000-0000-0000-000000000005') then
    raise exception 'Host read another account private invitation';
  end if;
  begin
    insert into storage.objects (bucket_id, name)
    values ('galleries', '99999999-0000-0000-0000-000000000001/stolen.png');
    raise exception 'Host uploaded into another account folder';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
reset request.jwt.claim.sub;
set role anon;
do $$
declare visible integer;
begin
  select count(*) into visible from public.invitations
  where id in ('99999999-1000-0000-0000-000000000001', '99999999-1000-0000-0000-000000000002');
  if visible <> 2 then raise exception 'Published invitations are not public'; end if;
  if exists (select 1 from public.invitations where id = '99999999-1000-0000-0000-000000000005') then
    raise exception 'Unauthenticated guest read a draft';
  end if;
  begin
    insert into public.rsvps (invitation_id, name, status)
    values ('99999999-1000-0000-0000-000000000001', 'Bypass', 'attending');
    raise exception 'Guest bypassed the response Edge Function';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
\echo 'PASS: confirmed host writes, blocked anonymous/unconfirmed writes, owner isolation, public shared links, and guest response boundary'
