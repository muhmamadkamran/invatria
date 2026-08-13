# Security tests

`rls.test.sql` attacks the policies in `../migrations/` directly: it asserts
that one host cannot read or modify another's invitation, that `owner_id`
cannot be spoofed, that anonymous visitors cannot insert an RSVP or read the
reply list, that storage folders are scoped per user, and that deletes cascade.

Run it against a throwaway Postgres — no Supabase account needed, because
`_shim.sql` stands in for the `auth` and `storage` schemas:

```bash
docker run -d --name invitra-pg -e POSTGRES_PASSWORD=pg -p 55432:5432 postgres:15
export PGPASSWORD=pg
PSQL="psql -h 127.0.0.1 -p 55432 -U postgres -q"
$PSQL -f supabase/tests/_shim.sql
$PSQL -f supabase/migrations/20260810120000_init.sql
$PSQL -f supabase/tests/rls.test.sql | grep -E 'PASS|FAIL'
```

Every line must read PASS. Against a real project use `supabase db reset`
instead of the shim.
