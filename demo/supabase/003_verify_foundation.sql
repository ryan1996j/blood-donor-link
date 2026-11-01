-- Read-only verification; safe to rerun after migrations 001 and 002.
select
 (select count(*) from public.bloodlink_locations) as townships,
 (select count(*) from public.bloodlink_profiles) as donor_profiles,
 (select count(*) from public.bloodlink_contacts) as contacts,
 (select count(*) from pg_tables where schemaname='public'
  and tablename like 'bloodlink_%' and rowsecurity) as rls_tables,
 (select count(*) from pg_policies where schemaname='public'
  and tablename like 'bloodlink_%') as policies,
 has_table_privilege('anon','public.bloodlink_profiles','select') as anon_profile_read,
 has_table_privilege('anon','public.bloodlink_contacts','select') as anon_contact_read;
