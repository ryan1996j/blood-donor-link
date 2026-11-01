-- BloodLink test project foundation. Review before applying.
-- Creates new objects only; intentionally fails on conflicting existing objects.
begin;

create table public.bloodlink_locations (
 township_code text primary key,
 region_code text not null,
 name_en text not null,
 name_my text not null,
 unique(township_code,region_code)
);
alter table public.bloodlink_locations enable row level security;
revoke all on public.bloodlink_locations from public, anon, authenticated;
grant select on public.bloodlink_locations to anon, authenticated;
create policy "Read standard locations" on public.bloodlink_locations
 for select to anon, authenticated using(true);

create function public.bloodlink_verified_owner(owner_id uuid) returns boolean
language sql stable security definer set search_path=''
as $$
 select owner_id=auth.uid() and exists(
  select 1 from auth.users u where u.id=auth.uid() and u.email_confirmed_at is not null
 );
$$;
revoke all on function public.bloodlink_verified_owner(uuid) from public, anon;
grant execute on function public.bloodlink_verified_owner(uuid) to authenticated;

create table public.bloodlink_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null check(length(trim(nickname)) between 1 and 50),
 township_code text not null,
 region_code text not null,
 blood_group text not null check(blood_group in ('O+','O-','A+','A-','B+','B-','AB+','AB-')),
 manual_available boolean not null default true,
 last_donation_date date,
 consent_version text not null check(length(consent_version) between 1 and 30),
 consented_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(township_code,region_code) references public.bloodlink_locations(township_code,region_code)
);
create function public.bloodlink_validate_profile() returns trigger
language plpgsql set search_path=''
as $$ begin
 if new.last_donation_date > (now() at time zone 'Asia/Yangon')::date then
  raise exception 'Donation date cannot be in the future';
 end if;
 if tg_op='UPDATE' then
  if new.id<>old.id then raise exception 'Profile owner cannot change'; end if;
  new.created_at:=old.created_at;
  new.consented_at:=old.consented_at;
 end if;
 new.updated_at:=now();
 return new;
end; $$;
revoke all on function public.bloodlink_validate_profile() from public, anon, authenticated;
create trigger bloodlink_profile_validation before insert or update on public.bloodlink_profiles
 for each row execute function public.bloodlink_validate_profile();
alter table public.bloodlink_profiles enable row level security;
revoke all on public.bloodlink_profiles from public, anon, authenticated;
grant select,insert,update,delete on public.bloodlink_profiles to authenticated;
create policy "Owner reads own profile including hidden" on public.bloodlink_profiles
 for select to authenticated using(public.bloodlink_verified_owner(id));
create policy "Owner creates own profile" on public.bloodlink_profiles
 for insert to authenticated with check(public.bloodlink_verified_owner(id));
create policy "Owner updates own profile" on public.bloodlink_profiles
 for update to authenticated using(public.bloodlink_verified_owner(id)) with check(public.bloodlink_verified_owner(id));
create policy "Owner removes own profile" on public.bloodlink_profiles
 for delete to authenticated using(public.bloodlink_verified_owner(id));

create table public.bloodlink_contacts (
 profile_id uuid primary key references public.bloodlink_profiles(id) on delete cascade,
 -- Fake numbers only during this test stage. Real phone verification is separate work.
 phone text not null check(phone ~ '^DEMO-[0-9]{4,8}$')
);
alter table public.bloodlink_contacts enable row level security;
revoke all on public.bloodlink_contacts from public, anon, authenticated;
grant select,insert,update,delete on public.bloodlink_contacts to authenticated;
create policy "Owner reads own contact" on public.bloodlink_contacts
 for select to authenticated using(public.bloodlink_verified_owner(profile_id));
create policy "Owner creates own contact" on public.bloodlink_contacts
 for insert to authenticated with check(public.bloodlink_verified_owner(profile_id));
create policy "Owner updates own contact" on public.bloodlink_contacts
 for update to authenticated using(public.bloodlink_verified_owner(profile_id)) with check(public.bloodlink_verified_owner(profile_id));
create policy "Owner removes own contact" on public.bloodlink_contacts
 for delete to authenticated using(public.bloodlink_verified_owner(profile_id));

create index bloodlink_profile_filters on public.bloodlink_profiles(region_code,township_code,blood_group) where manual_available;
commit;
