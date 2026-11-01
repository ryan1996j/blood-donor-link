import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {PGlite} from '@electric-sql/pglite';
import foundation from '../supabase/001_donor_foundation.sql?raw';
import locations from '../supabase/002_locations.sql?raw';
import search from '../supabase/004_public_search.sql?raw';
import CloudSearch from './CloudSearch.jsx';
import {translations} from './translations.js';
import {resolveTown} from './locations.js';
import './style.css';

async function setup(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
 grant usage on schema auth to authenticated;`);
 await db.exec(foundation);await db.exec(locations);await db.exec(search);
 const town=resolveTown('Insein');
 for(let i=1;i<=60;i++){
  const id=`00000000-0000-0000-0000-${String(i).padStart(12,'0')}`;
  await db.query('insert into auth.users values($1,now())',[id]);
  await db.query(`insert into public.bloodlink_profiles(id,nickname,township_code,region_code,blood_group,manual_available,last_donation_date,consent_version) values($1,$2,$3,$4,'O+',$5,case when $6 then (now() at time zone 'Asia/Yangon')::date-1 else null end,'v4-search-test')`,[id,`Demo Donor ${i}`,town.id,town.region,i!==59,i===60]);
  await db.query("insert into public.bloodlink_contacts values($1,'DEMO-1234')",[id]);
 }
 await db.exec('set role anon');
 return {rpc:async(name,args)=>{
  try{
   if(name==='bloodlink_search_donors')return {data:(await db.query('select * from public.bloodlink_search_donors($1,$2,$3,$4)',[args.p_region,args.p_township,args.p_blood,args.p_after])).rows};
   if(name==='bloodlink_open_donor')return {data:(await db.query('select * from public.bloodlink_open_donor($1)',[args.p_id])).rows};
   throw Error('Unknown preview endpoint');
  }catch(error){return {error};}
 }};
}
// Separate page, fake in-memory database only; never reads the hosted database.
const ready=setup();
function Preview(){
 const [client,setClient]=useState(null),[error,setError]=useState(''),[lang,setLang]=useState('my');
 useEffect(()=>{ready.then(setClient).catch(e=>setError(e.message));},[]);
 useEffect(()=>{document.documentElement.lang=lang;},[lang]);
 return <><div className="demo-banner">{lang==='my'?'ကွန်ပျူတာတွင်း PostgreSQL စမ်းသပ်မှု · ဒေတာအတုသာ · Supabase မပြောင်းပါ':'LOCAL POSTGRESQL PREVIEW · Fictional data only · Hosted Supabase unchanged'}</div><header className="shell header"><span className="brand">BloodLink</span><button className="language" onClick={()=>setLang(lang==='my'?'en':'my')}>{lang==='my'?'English':'မြန်မာ'}</button></header><main className="shell"><p className="muted">{lang==='my'?'အင်းစိန်၊ O+ အလှူရှင်အတု ၅၈ ဦး။ ဖျောက်ထားသူ ၁ ဦးနှင့် ရက် ၉၀ အနားယူသူ ၁ ဦးကို မပြပါ။':'58 available Insein O+ donors; one hidden and one paused donor are excluded.'}</p>{error?<p role="alert">{error}</p>:client?<CloudSearch lang={lang} t={translations[lang]} client={client}/>:<p role="status">{lang==='my'?'စမ်းသပ် database ဖွင့်နေသည်…':'Starting the local test database…'}</p>}</main></>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
