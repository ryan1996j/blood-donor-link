-- Approved and applied to hosted Supabase on 2026-11-01. Do not rerun.
-- One RPC statement saves both rows or rolls back both rows on any error.
begin;
create function public.bloodlink_save_profile(
 p_nickname text,p_township text,p_region text,p_blood text,
 p_available boolean,p_last_donation date,p_consent_version text,p_phone text
) returns jsonb
language plpgsql security invoker set search_path=''
as $$
declare
 owner_id uuid := auth.uid();
 saved public.bloodlink_profiles;
begin
 if owner_id is null or not public.bloodlink_verified_owner(owner_id) then
  raise exception 'A verified account is required' using errcode='42501';
 end if;
 if p_consent_version is null or p_consent_version not in ('v4-test','v4-search-test') then
  raise exception 'Invalid consent version' using errcode='22023';
 end if;
 insert into public.bloodlink_profiles as p
  (id,nickname,township_code,region_code,blood_group,manual_available,last_donation_date,consent_version)
 values(owner_id,trim(p_nickname),p_township,p_region,p_blood,p_available,p_last_donation,p_consent_version)
 on conflict(id) do update set
  nickname=excluded.nickname,township_code=excluded.township_code,
  region_code=excluded.region_code,blood_group=excluded.blood_group,
  manual_available=excluded.manual_available,last_donation_date=excluded.last_donation_date,
  consent_version=excluded.consent_version
 returning p.* into saved;

 insert into public.bloodlink_contacts(profile_id,phone) values(owner_id,p_phone)
 on conflict(profile_id) do update set phone=excluded.phone;

 return to_jsonb(saved)||jsonb_build_object('phone',p_phone);
end;
$$;
revoke all on function public.bloodlink_save_profile(text,text,text,text,boolean,date,text,text) from public,anon,authenticated;
grant execute on function public.bloodlink_save_profile(text,text,text,text,boolean,date,text,text) to authenticated;
commit;
