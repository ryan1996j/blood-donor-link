import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {resolveTown} from '../src/locations.js';
test('moderation enforces roles, privacy, suspension, appeals and atomic decisions',async()=>{
 const db=new PGlite(),a='00000000-0000-0000-0000-000000000001',b='00000000-0000-0000-0000-000000000002',admin='00000000-0000-0000-0000-000000000003';
 const login=async id=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
 const state=async()=>(await db.query('select public.bloodlink_moderation_state() as s')).rows[0].s;
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;`);
 for(const file of ['001_donor_foundation.sql','002_locations.sql','004_public_search.sql','005_atomic_profile_save.sql','006_moderation_draft.sql'])await db.exec(await readFile(new URL('../supabase/'+file,import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1,now()),($2,now()),($3,now())',[a,b,admin]);await db.query('insert into public.bloodlink_admins values($1)',[admin]);
 const town=resolveTown('Insein');await login(a);
 await db.query("select public.bloodlink_save_profile('Test',$1,$2,'O+',true,null,'v4-search-test','DEMO-1234')",[town.id,town.region]);
 await login(b);await assert.rejects(db.query('insert into public.bloodlink_admins values($1)',[b]),/permission denied/);
 await db.query("select public.bloodlink_submit_report($1,'incorrect','Please review location')",[a]);assert.deepEqual((await state()).reports,[]);
 await assert.rejects(db.query('select * from public.bloodlink_reports'),/permission denied/);
 await login(admin);let s=await state();assert.equal(s.admin,true);const report=s.reports[0].id;assert.equal('reporter_id' in s.reports[0],false);
 await assert.rejects(db.query("select public.bloodlink_decide($1,'report','accept',' ')",[report]));
 assert.equal((await state()).reports[0].status,'open');
 await login(b);await assert.rejects(db.query("select public.bloodlink_decide($1,'report','accept','Hide profile')",[report]),/Admin access/);
 await login(admin);await db.query("select public.bloodlink_decide($1,'report','accept','Correct your location')",[report]);
 await login(a);s=await state();assert.equal(s.suspended,true);assert.equal(s.notices[0].message,'Correct your location');
 assert.equal((await db.query('select * from public.bloodlink_search_donors()')).rows.length,0);assert.equal((await db.query('select * from public.bloodlink_open_donor($1)',[a])).rows.length,0);
 await db.query('delete from public.bloodlink_profiles where id=$1',[a]);
 await db.query("select public.bloodlink_save_profile('Recreated',$1,$2,'O+',true,null,'v4-search-test','DEMO-1234')",[town.id,town.region]);assert.equal((await state()).suspended,true);
 await db.query("select public.bloodlink_request_review('Location corrected')");await assert.rejects(db.query("select public.bloodlink_request_review('Duplicate appeal')"));
 await login(b);assert.deepEqual((await state()).reviews,[]);assert.deepEqual((await state()).notices,[]);
 await login(admin);s=await state();let review=s.reviews[0].id;await db.query("select public.bloodlink_decide($1,'review','suspend','Please correct township')",[review]);
 await login(a);await db.query("select public.bloodlink_request_review('Corrected township now')");await db.query('update public.bloodlink_profiles set manual_available=false where id=$1',[a]);
 await login(admin);review=(await state()).reviews.find(r=>r.status==='pending').id;await db.query("select public.bloodlink_decide($1,'review','restore','Correction accepted')",[review]);
 await assert.rejects(db.query("select public.bloodlink_decide($1,'review','restore','Duplicate decision')",[review]),/already reviewed/);
 await login(a);assert.equal((await state()).suspended,false);assert.equal((await db.query('select * from public.bloodlink_search_donors()')).rows.length,0);
 await db.exec('reset role;set role anon');await assert.rejects(db.query('select public.bloodlink_moderation_state()'),/permission denied/);
 }finally{await db.close();}
});
