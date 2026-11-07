-- Applied to approved project nrourasyvlpjlxfophts on 2026-11-07. Do not rerun.
-- Admin membership was separately assigned to the verified owner account with explicit approval.
begin;
create table public.bloodlink_admins(user_id uuid primary key references auth.users(id) on delete cascade);
create table public.bloodlink_moderation(donor_id uuid primary key references auth.users(id) on delete cascade,suspended boolean not null default false);
create table public.bloodlink_reports(id uuid primary key default gen_random_uuid(),donor_id uuid not null references auth.users(id) on delete cascade,reporter_id uuid not null references auth.users(id),reason text not null check(reason in ('incorrect','unreachable','abuse','other')),message text not null check(length(trim(message)) between 3 and 500),status text not null default 'open',created_at timestamptz not null default now());
create table public.bloodlink_reviews(id uuid primary key default gen_random_uuid(),donor_id uuid not null references auth.users(id) on delete cascade,message text not null check(length(trim(message)) between 3 and 500),status text not null default 'pending',created_at timestamptz not null default now());
create unique index bloodlink_one_pending_review on public.bloodlink_reviews(donor_id) where status='pending';
create table public.bloodlink_decisions(id uuid primary key default gen_random_uuid(),donor_id uuid not null references auth.users(id) on delete cascade,report_id uuid references public.bloodlink_reports(id),review_id uuid references public.bloodlink_reviews(id),actor_id uuid not null references auth.users(id),action text not null check(action in ('accept','reject','restore','suspend')),message text not null check(length(trim(message)) between 3 and 300),created_at timestamptz not null default now());
alter table public.bloodlink_admins enable row level security;
revoke all on public.bloodlink_admins from public,anon,authenticated;
alter table public.bloodlink_moderation enable row level security;
revoke all on public.bloodlink_moderation from public,anon,authenticated;
alter table public.bloodlink_reports enable row level security;
revoke all on public.bloodlink_reports from public,anon,authenticated;
alter table public.bloodlink_reviews enable row level security;
revoke all on public.bloodlink_reviews from public,anon,authenticated;
alter table public.bloodlink_decisions enable row level security;
revoke all on public.bloodlink_decisions from public,anon,authenticated;
create function public.bloodlink_is_admin() returns boolean language sql stable security definer set search_path='' as $$ select public.bloodlink_verified_owner(auth.uid()) and exists(select 1 from public.bloodlink_admins where user_id=auth.uid()); $$;
create function public.bloodlink_moderation_state() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.bloodlink_verified_owner(auth.uid()) then raise exception 'Verified login required'; end if;
 return jsonb_build_object('admin',public.bloodlink_is_admin(),
 'suspended',coalesce((select suspended from public.bloodlink_moderation where donor_id=auth.uid()),false),
 'notices',coalesce((select jsonb_agg(jsonb_build_object('id',id,'action',action,'message',message,'created_at',created_at) order by created_at desc) from public.bloodlink_decisions where donor_id=auth.uid()),'[]'::jsonb),
 'reviews',coalesce((select jsonb_agg(to_jsonb(r) order by created_at desc) from public.bloodlink_reviews r where donor_id=auth.uid() or public.bloodlink_is_admin()),'[]'::jsonb),
 'reports',case when public.bloodlink_is_admin() then coalesce((select jsonb_agg(to_jsonb(r)-'reporter_id' || jsonb_build_object('nickname',p.nickname) order by r.created_at desc) from public.bloodlink_reports r left join public.bloodlink_profiles p on p.id=r.donor_id),'[]'::jsonb) else '[]'::jsonb end);
end; $$;
create function public.bloodlink_submit_report(p_donor uuid,p_reason text,p_message text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.bloodlink_verified_owner(auth.uid()) then raise exception 'Verified login required'; end if;
 if not exists(select 1 from public.bloodlink_open_donor(p_donor)) then raise exception 'Profile unavailable'; end if;
 insert into public.bloodlink_reports(donor_id,reporter_id,reason,message) values(p_donor,auth.uid(),p_reason,trim(p_message));
end; $$;
create function public.bloodlink_request_review(p_message text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.bloodlink_verified_owner(auth.uid()) then raise exception 'Verified login required'; end if;
 perform 1 from public.bloodlink_moderation where donor_id=auth.uid() and suspended for update;
 if not found then raise exception 'Profile is not suspended'; end if;
 insert into public.bloodlink_reviews(donor_id,message) values(auth.uid(),trim(p_message));
end; $$;
create function public.bloodlink_decide(p_id uuid,p_kind text,p_action text,p_message text) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if not public.bloodlink_is_admin() then raise exception 'Admin access required'; end if;
 if p_kind='report' and p_action in ('accept','reject') then
  select donor_id into target from public.bloodlink_reports where id=p_id and status='open' for update;
 elsif p_kind='review' and p_action in ('restore','suspend') then
  select donor_id into target from public.bloodlink_reviews where id=p_id and status='pending' for update;
 else raise exception 'Invalid decision'; end if;
 if target is null then raise exception 'This item is already reviewed or unavailable'; end if;
 -- Serialize with review submissions; donor edits/deletion cannot erase this auth-user keyed suspension.
 insert into public.bloodlink_moderation(donor_id) values(target) on conflict do nothing;
 perform 1 from public.bloodlink_moderation where donor_id=target for update;
 if p_action<>'reject' then update public.bloodlink_moderation set suspended=p_action in ('accept','suspend') where donor_id=target; end if;
 insert into public.bloodlink_decisions(donor_id,report_id,review_id,actor_id,action,message) values(target,case when p_kind='report' then p_id end,case when p_kind='review' then p_id end,auth.uid(),p_action,trim(p_message));
 if p_kind='report' then update public.bloodlink_reports set status=p_action where id=p_id;
 else update public.bloodlink_reviews set status=p_action where id=p_id; end if;
end; $$;
revoke all on function public.bloodlink_is_admin() from public,anon,authenticated;
grant execute on function public.bloodlink_is_admin() to authenticated;
revoke all on function public.bloodlink_moderation_state() from public,anon,authenticated;
grant execute on function public.bloodlink_moderation_state() to authenticated;
revoke all on function public.bloodlink_submit_report(uuid,text,text) from public,anon,authenticated;
grant execute on function public.bloodlink_submit_report(uuid,text,text) to authenticated;
revoke all on function public.bloodlink_request_review(text) from public,anon,authenticated;
grant execute on function public.bloodlink_request_review(text) to authenticated;
revoke all on function public.bloodlink_decide(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.bloodlink_decide(uuid,text,text,text) to authenticated;
create or replace function public.bloodlink_search_donors(
 p_region text default null, p_township text default null,
 p_blood text default null, p_after uuid default null
) returns table(id uuid,nickname text,township_code text,region_code text,blood_group text)
language sql stable security definer set search_path=''
as $$
 select p.id,p.nickname,p.township_code,p.region_code,p.blood_group
 from public.bloodlink_profiles p
 join public.bloodlink_contacts c on c.profile_id=p.id
 join auth.users u on u.id=p.id
 where not exists(select 1 from public.bloodlink_moderation m where m.donor_id=p.id and m.suspended) and p.manual_available and p.consent_version='v4-search-test'
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

create or replace function public.bloodlink_open_donor(p_id uuid)
returns table(nickname text,township_code text,region_code text,phone text)
language sql stable security definer set search_path=''
as $$
 select p.nickname,p.township_code,p.region_code,c.phone
 from public.bloodlink_profiles p
 join public.bloodlink_contacts c on c.profile_id=p.id
 join auth.users u on u.id=p.id
 where not exists(select 1 from public.bloodlink_moderation m where m.donor_id=p.id and m.suspended) and p.id=p_id and p.manual_available and p.consent_version='v4-search-test'
 and u.email_confirmed_at is not null and c.phone ~ '^DEMO-[0-9]{4,8}$'
 and (p.last_donation_date is null or p.last_donation_date+90 <= (now() at time zone 'Asia/Yangon')::date);
$$;
revoke all on function public.bloodlink_open_donor(uuid) from public,anon,authenticated;
grant execute on function public.bloodlink_open_donor(uuid) to anon,authenticated;

commit;
