import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {resolveTown} from '../src/locations.js';
import {saveProfile} from '../src/saveProfile.js';

test('atomic save uses caller identity, RLS and all-or-nothing transactions',async t=>{
 const db=new PGlite();
 const a='00000000-0000-0000-0000-000000000001',b='00000000-0000-0000-0000-000000000002',unverified='00000000-0000-0000-0000-000000000003';
 const town=resolveTown('Insein');
 const call=(nickname='Test A',phone='DEMO-1234',blood='O+',consent='v4-search-test')=>db.query('select public.bloodlink_save_profile($1,$2,$3,$4,true,null,$5,$6) as saved',[nickname,town.id,town.region,blood,consent,phone]);
 const login=async id=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
 try{
  await db.exec(`create role anon;create role authenticated;create schema auth;
   create table auth.users(id uuid primary key,email_confirmed_at timestamptz);
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   grant usage on schema auth to authenticated;`);
  for(const file of ['001_donor_foundation.sql','002_locations.sql','005_atomic_profile_save.sql'])await db.exec(await readFile(new URL('../supabase/'+file,import.meta.url),'utf8'));
  await db.query('insert into auth.users values($1,now()),($2,now()),($3,null)',[a,b,unverified]);
  await login(a);
  await t.test('failed new contact leaves neither a profile nor a contact',async()=>{
   await assert.rejects(call('Test A','real-number'),/check constraint/);
   assert.equal((await db.query('select * from public.bloodlink_profiles')).rows.length,0);
   assert.equal((await db.query('select * from public.bloodlink_contacts')).rows.length,0);
  });
  await t.test('successful creation returns only the owner saved data and demo contact',async()=>{
   const saved=(await call()).rows[0].saved;
   assert.equal(saved.id,a);assert.equal(saved.nickname,'Test A');assert.equal(saved.phone,'DEMO-1234');
   assert.equal((await db.query('select * from public.bloodlink_contacts')).rows.length,1);
  });
  await t.test('contact failure rolls back edits to the existing profile and preserves contact',async()=>{
   const before=(await db.query('select * from public.bloodlink_profiles')).rows[0];
   await assert.rejects(call('Changed name','invalid','B+','v4-test'),/check constraint/);
   assert.deepEqual((await db.query('select * from public.bloodlink_profiles')).rows[0],before);
   assert.equal((await db.query('select phone from public.bloodlink_contacts')).rows[0].phone,'DEMO-1234');
  });
  await t.test('profile validation failure preserves the existing contact too',async()=>{
   await assert.rejects(call('Changed name','DEMO-9999','INVALID'),/check constraint/);
   assert.equal((await db.query('select nickname from public.bloodlink_profiles')).rows[0].nickname,'Test A');
   assert.equal((await db.query('select phone from public.bloodlink_contacts')).rows[0].phone,'DEMO-1234');
  });
  await t.test('successful update changes both rows and retains original creation time',async()=>{
   const before=(await db.query('select created_at from public.bloodlink_profiles')).rows[0].created_at;
   const saved=(await call('Updated A','DEMO-9999','B+')).rows[0].saved;
   assert.equal(saved.nickname,'Updated A');assert.equal(saved.phone,'DEMO-9999');assert.equal(saved.blood_group,'B+');
   assert.equal((await db.query('select created_at from public.bloodlink_profiles')).rows[0].created_at.getTime(),before.getTime());
  });
  await t.test('account B saves its own rows and cannot alter A',async()=>{
   await login(b);assert.equal((await call('Test B','DEMO-2222')).rows[0].saved.id,b);
   assert.equal((await db.query('select * from public.bloodlink_profiles where id=$1',[a])).rows.length,0);
   await login(a);assert.equal((await db.query('select nickname from public.bloodlink_profiles')).rows[0].nickname,'Updated A');
   assert.equal((await db.query('select phone from public.bloodlink_contacts')).rows[0].phone,'DEMO-9999');
  });
  await t.test('unverified and unauthenticated callers cannot save',async()=>{
   await login(unverified);await assert.rejects(call(),/verified account/);
   await login('');await assert.rejects(call(),/verified account/);
   await db.exec('reset role;set role anon');await assert.rejects(call(),/permission denied/);
  });
 }finally{await db.close();}
});

test('frontend uses one RPC without accepting a client-supplied owner ID',async()=>{
 const profile={id:'forged-owner',nickname:'Test',township_code:'town',region_code:'region',blood_group:'O+',manual_available:true,last_donation_date:null,consent_version:'v4-search-test'};
 let calls=0;
 const result=await saveProfile({rpc:async(name,args)=>{calls++;assert.equal(name,'bloodlink_save_profile');assert.equal(Object.hasOwn(args,'id'),false);assert.equal(Object.hasOwn(args,'p_id'),false);assert.equal(args.p_phone,'DEMO-1234');return {data:{id:'actual-owner',phone:'DEMO-1234'}};}},profile,'DEMO-1234');
 assert.equal(calls,1);assert.equal(result.id,'actual-owner');
 await assert.rejects(saveProfile({rpc:async()=>({error:new Error('contact failed')})},profile,'DEMO-1234'),/contact failed/);
 await assert.rejects(saveProfile({rpc:async()=>({data:null})},profile,'DEMO-1234'),/could not be confirmed/);
});
