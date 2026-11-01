# Supabase foundation review

## Approved public search stage — 1 November 2026

`004_public_search.sql` was approved and applied to hosted Supabase. Both public RPCs returned HTTP 200; direct anonymous reads of profile/contact tables remained denied. Initial public search returned zero eligible donors because existing profiles have not yet opted in. The frontend feature flag `VITE_PUBLIC_SEARCH_ENABLED` defaults to false and is enabled on Netlify for this release. Do not rerun the migration.

The two read-only RPCs deliberately expose opted-in (`v4-search-test`) available, verified donors with DEMO contacts. Existing `v4-test` records stay private until their owner edits, consents to public listing, and saves. Search has only id, nickname, township, region, blood group; contact RPC has only nickname, township, region, DEMO phone. Email, donation dates, account metadata and private contact tables are not exposed. Table RLS and owner-only write policies remain intact. Contact opening rechecks availability on the server, including manual rest and 90 calendar days in Asia/Yangon. Search uses stable UUID cursors, ten visible rows plus one lookahead; it does not download all donors or return a total count.

Local tests cover 58+ donors, hidden/paused/unverified/non-consenting/missing-contact exclusions, day-90 return, direct table denials, and simulated account B reading/updating account A's private records. Hosted two-account verification remains pending. Public contact endpoints can still be enumerated; fake contacts only, and rate limits/abuse controls are required before real phone numbers. UI-only reveal is not a security boundary.

Review locally: `http://127.0.0.1:4173/cloud-search-preview.html` starts an isolated, in-memory PostgreSQL database with fake donors. It never reads/writes hosted profiles. The preview files are development-only HTML entries, outside the production build entry.

## Applied status on 1 November 2026

Migrations 001 and 002 were executed in the approved BloodLink project through the Supabase dashboard. The verification query returned: 330 township records, 0 donor profiles, 0 contacts, 3 RLS-enabled tables, 9 policies, anonymous profile read false, anonymous contact read false.

Independent anonymous REST requests using the publishable key returned permission denied for profiles and contacts, and HTTP 200 for locations. No demo profiles, authentication users or real personal data were created by this setup. Two-account ownership tests, email delivery, and application integration are still pending. Do not rerun migrations 001/002; use `003_verify_foundation.sql` to inspect the existing foundation.

Target test project: `nrourasyvlpjlxfophts` (BloodLink).

A read-only dashboard query on 1 November 2026 returned no public tables. The public Auth settings report email enabled and email confirmation required. These observations do not prove SMTP delivery or application authorization.

## Proposed migration

1. Review `001_donor_foundation.sql` and run it in the intended project's SQL Editor.
2. Review and run `002_locations.sql` to load the existing 330 township codes and their grouped regions.
3. Verify RLS and ownership using two confirmed test users before connecting real user interfaces.

The first migration creates three tables and owner-only policies. No existing object is dropped or replaced. It fails on a conflicting object rather than silently changing an existing schema. Private profiles and contacts have no anonymous table grants or public read policy. Only non-sensitive location records are publicly readable. Verified authenticated users can operate only on rows tied to their own auth user ID, including hidden profiles. Contacts accept fictional `DEMO-1234` numbers only.

This is a foundation, not the complete PRD backend. Public search/contact APIs with eligibility checks and anti-scraping limits, phone verification, account-deletion jobs, production controls and connected application integration are separate stages. The existing frontend remains the browser-only demo until integration is implemented and tested. No fake browser-local donor profiles are imported into Supabase by these scripts.

## Verification query

```sql
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename like 'bloodlink_%';
select count(*) from public.bloodlink_locations;
select tablename, policyname, roles, cmd from pg_policies
where schemaname='public' and tablename like 'bloodlink_%';
```

Expected: three RLS-enabled tables, 330 locations after step 2, owner-only private policies, no donor/contact rows until a test user creates them. Do not disable email confirmation to make tests easier. Public publishable keys are not administrator credentials; never request or put secret keys or database passwords into frontend code.
