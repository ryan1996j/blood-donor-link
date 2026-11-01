import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {resolveTown} from '../src/locations.js';
import {searchPage,openDonor} from '../src/donorSearch.js';

test('public search SQL: bounded pages, private contacts, consent and owner isolation',async t=>{
 const db=new PGlite();
 const uuid=i=>`00000000-0000-0000-0000-${String(i).padStart(12,'0')}`;
 try{
  await db.exec(`create role anon; create role authenticated; create schema auth;
   create table auth.users(id uuid primary key,email_confirmed_at timestamptz);
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   grant usage on schema auth to authenticated;`);
  for(const file of ['001_donor_foundation.sql','002_locations.sql','004_public_search.sql'])await db.exec(await readFile(new URL('../supabase/'+file,import.meta.url),'utf8'));
  const town=resolveTown('Insein');
  for(let i=1;i<=65;i++){
   await db.query('insert into auth.users values($1,case when $2 then null else now() end)',[uuid(i),i===63]);
   await db.query(`insert into public.bloodlink_profiles(id,nickname,township_code,region_code,blood_group,manual_available,last_donation_date,consent_version)
    values($1,$2,$3,$4,'O+',$5,case when $6=60 then (now() at time zone 'Asia/Yangon')::date-89 when $6=64 then (now() at time zone 'Asia/Yangon')::date-90 else null end,$7)`,[uuid(i),'Donor '+i,town.id,town.region,![59,65].includes(i),i,i===61?'v4-test':'v4-search-test']);
   if(i!==62)await db.query('insert into public.bloodlink_contacts values($1,$2)',[uuid(i),'DEMO-1234']);
  }
  await db.exec('set role anon');
  await t.test('anonymous callers cannot read profile/contact tables directly',async()=>{
   await assert.rejects(db.query('select * from public.bloodlink_profiles'),/permission denied/);
   await assert.rejects(db.query('select * from public.bloodlink_contacts'),/permission denied/);
  });
  await t.test('search has exactly five fields and never contains contact/email',async()=>{
   const {rows}=await db.query('select * from public.bloodlink_search_donors()');
   assert.equal(rows.length,11);
   assert.deepEqual(Object.keys(rows[0]).sort(),['blood_group','id','nickname','region_code','township_code']);
  });
  await t.test('keyset pagination returns all eligible donors without gaps or duplicates',async()=>{
   let after=null,all=[];
   while(true){const {rows}=await db.query('select * from public.bloodlink_search_donors(null,null,null,$1)',[after]);if(!rows.length)break;const page=rows.slice(0,10);all.push(...page);after=page.at(-1).id;if(rows.length<=10)break;}
   assert.equal(all.length,59);assert.equal(new Set(all.map(x=>x.id)).size,59);
   for(const i of [59,60,61,62,63,65])assert.ok(!all.some(x=>x.id===uuid(i)));
   assert.ok(all.some(x=>x.id===uuid(64)),'day 90 returns automatically');
   assert.equal((await db.query("select * from public.bloodlink_search_donors(null,null,'B+',null)")).rows.length,0);
   assert.equal((await db.query("select * from public.bloodlink_search_donors('MMR001',null,null,null)")).rows.length,0);
  });
  await t.test('open profile reveals only the four approved fields and rechecks availability',async()=>{
   const row=(await db.query('select * from public.bloodlink_open_donor($1)',[uuid(1)])).rows[0];
   assert.deepEqual(Object.keys(row).sort(),['nickname','phone','region_code','township_code']);
   for(const i of [59,60,61,62,63,65])assert.equal((await db.query('select * from public.bloodlink_open_donor($1)',[uuid(i)])).rows.length,0);
   await db.exec('reset role');await db.query('update public.bloodlink_profiles set manual_available=false where id=$1',[uuid(1)]);await db.exec('set role anon');
   assert.equal((await db.query('select * from public.bloodlink_open_donor($1)',[uuid(1)])).rows.length,0);
  });
  await t.test('signed-in B cannot read or edit A private records',async()=>{
   await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uuid(2)]);await db.exec('set role authenticated');
   assert.equal((await db.query('select * from public.bloodlink_profiles where id=$1',[uuid(1)])).rows.length,0);
   assert.equal((await db.query('select * from public.bloodlink_contacts where profile_id=$1',[uuid(1)])).rows.length,0);
   assert.equal((await db.query("update public.bloodlink_profiles set nickname='Changed by B' where id=$1 returning id",[uuid(1)])).rows.length,0);
   assert.equal((await db.query("update public.bloodlink_contacts set phone='DEMO-9999' where profile_id=$1 returning profile_id",[uuid(1)])).rows.length,0);
   assert.equal((await db.query('select * from public.bloodlink_profiles where id=$1',[uuid(2)])).rows.length,1);
   await assert.rejects(db.query("insert into public.bloodlink_contacts(profile_id,phone) values($1,'DEMO-9999') on conflict(profile_id) do update set phone=excluded.phone",[uuid(1)]),/row-level security/);
  });
 }finally{await db.close();}
});

test('client pagination sends cursor/filters and keeps the lookahead row for the next page',async()=>{
 const rows=Array.from({length:11},(_,i)=>({id:String(i),nickname:'Fake'}));let args;
 const client={rpc:async(name,input)=>{args={name,input};return {data:rows,error:null};}};
 const page=await searchPage(client,{region:'MMR013',town:'town',blood:'O+'},'cursor');
 assert.equal(page.items.length,10);assert.equal(page.more,true);assert.equal(page.cursor,'9');
 assert.deepEqual(args.input,{p_region:'MMR013',p_township:'town',p_blood:'O+',p_after:'cursor'});
 const failure={rpc:async()=>({error:new Error('offline')})};
 await assert.rejects(searchPage(failure),/offline/);await assert.rejects(openDonor(failure,'id'),/offline/);
 assert.equal(await openDonor({rpc:async()=>({data:[]})},'hidden'),null);
});
