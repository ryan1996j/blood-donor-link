-- Applied to the approved BloodLink project on 2026-11-01. Do not rerun.
-- Public, read-only endpoints; no general profile/contact table grants.
-- Only explicitly opted-in test profiles with DEMO contacts can be exposed.
begin;
create function public.bloodlink_search_donors(
 p_region text default null, p_township text default null,
 p_blood text default null, p_after uuid default null
) returns table(id uuid,nickname text,township_code text,region_code text,blood_group text)
language sql stable security definer set search_path=''
as $$
 select p.id,p.nickname,p.township_code,p.region_code,p.blood_group
 from public.bloodlink_profiles p
 join public.bloodlink_contacts c on c.profile_id=p.id
 join auth.users u on u.id=p.id
 where p.manual_available and p.consent_version='v4-search-test'
 and u.email_confirmed_at is not null and c.phone ~ '^DEMO-[0-9]{4,8}$'
 and (p.last_donation_date is null or p.last_donation_date+90 <= (now() at time zone 'Asia/Yangon')::date)
 and (p_region is null or p.region_code=p_region)
 and (p_township is null or p.township_code=p_township)
 and (p_blood is null or p.blood_group=p_blood)
 and (p_after is null or p.id>p_after)
 order by p.id limit 11;
$$;
revoke all on function public.bloodlink_search_donors(text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.bloodlink_search_donors(text,text,text,uuid) to anon,authenticated;

create function public.bloodlink_open_donor(p_id uuid)
returns table(nickname text,township_code text,region_code text,phone text)
language sql stable security definer set search_path=''
as $$
 select p.nickname,p.township_code,p.region_code,c.phone
 from public.bloodlink_profiles p
 join public.bloodlink_contacts c on c.profile_id=p.id
 join auth.users u on u.id=p.id
 where p.id=p_id and p.manual_available and p.consent_version='v4-search-test'
 and u.email_confirmed_at is not null and c.phone ~ '^DEMO-[0-9]{4,8}$'
 and (p.last_donation_date is null or p.last_donation_date+90 <= (now() at time zone 'Asia/Yangon')::date);
$$;
revoke all on function public.bloodlink_open_donor(uuid) from public,anon,authenticated;
grant execute on function public.bloodlink_open_donor(uuid) to anon,authenticated;
commit;
