import React,{useEffect,useRef,useState} from 'react';
import {supabase} from './supabase.js';
import {groups} from './data.js';

const empty={nickname:'',phone:'DEMO-1234',blood_group:'',township_code:'',region_code:'',manual_available:true,last_donation_date:null};
import {yangonToday,returnDate} from './profileDates.js';

export default function LiveAccount({lang,t,LocationFields,DonationHistory,initialMode='login',initialError='',onSession,onRecovered}){
 const txt=(en,my)=>lang==='my'?my:en;
 const [session,setSession]=useState(null),[loading,setLoading]=useState(true),[loaded,setLoaded]=useState(false),[exists,setExists]=useState(false),[draft,setDraft]=useState(empty),[mode,setMode]=useState(initialMode),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(initialError),[message,setMessage]=useState(''),[version,setVersion]=useState(0);
 const owner=useRef(null),request=useRef(0);
 useEffect(()=>{
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,next)=>{
   owner.current=next?.user.id||null;setSession(next);onSession(Boolean(next));setLoading(false);
   if(event==='PASSWORD_RECOVERY')setMode('reset');
   if(!next){setDraft(empty);setExists(false);setLoaded(false);}
  });
  return()=>subscription.unsubscribe();
 },[]);
 const id=session?.user.id;
 useEffect(()=>{
  if(!id)return;
  const ticket=++request.current;let active=true;setLoaded(false);setError('');
  (async()=>{try{
   const [profile,contact]=await Promise.all([supabase.from('bloodlink_profiles').select('*').eq('id',id).maybeSingle(),supabase.from('bloodlink_contacts').select('phone').eq('profile_id',id).maybeSingle()]);
   if(profile.error)throw profile.error;if(contact.error)throw contact.error;
   if(active&&ticket===request.current){setExists(Boolean(profile.data));setDraft({...empty,...profile.data,phone:contact.data?.phone||'DEMO-1234'});setLoaded(true);}
  }catch(e){if(active)setError(e.message);}})();
  return()=>{active=false;};
 },[id,version]);
 const run=async work=>{if(busy)return;setBusy(true);setError('');setMessage('');try{await work();}catch(e){setError(e.message||txt('Could not connect. Try again.','ချိတ်ဆက်မရပါ။ ပြန်စမ်းပါ။'));}finally{setBusy(false);}};
 const redirect=window.location.origin+'/';
 const change=next=>{setMode(next);setError('');setMessage('');setPassword('');setConfirm('');};
 const auth=e=>{e.preventDefault();run(async()=>{
  const address=email.trim();let result;
  if(mode==='forgot'){
   result=await supabase.auth.resetPasswordForEmail(address,{redirectTo:redirect});
  }else{
   if((mode==='signup'||mode==='reset')&&password!==confirm)throw Error(txt('Passwords do not match.','စကားဝှက်နှစ်ခု မတူပါ။'));
   if(mode==='signup')result=await supabase.auth.signUp({email:address,password,options:{emailRedirectTo:redirect}});
   else if(mode==='reset')result=await supabase.auth.updateUser({password});
   else result=await supabase.auth.signInWithPassword({email:address,password});
  }
  if(result.error)throw result.error;
  setPassword('');setConfirm('');
  if(mode==='reset'){onRecovered();setMode('login');setMessage(txt('Password updated.','စကားဝှက် ပြောင်းပြီးပါပြီ။'));}
  else if(mode==='signup')setMessage(txt('Check your email for a confirmation link, then return here to log in.','အီးမေးလ်ထဲက အတည်ပြုလင့်ခ်ကို နှိပ်ပြီး Login ပြန်ဝင်ပါ။'));
  else if(mode==='forgot')setMessage(txt('If an account exists, a reset link will be sent. Check your inbox and spam folder.','အကောင့်ရှိပါက reset link ပို့ပေးပါမည်။ Inbox နှင့် Spam ကို စစ်ပါ။'));
 });};
 const save=e=>{e.preventDefault();const form=new FormData(e.currentTarget);run(async()=>{
  if(!id||owner.current!==id)throw Error('Please log in again.');
  const last=form.get('donatedBefore')==='yes'?String(form.get('donationDate')||''):null;
  if(last&&last>yangonToday())throw Error(txt('Donation date cannot be in the future.','အနာဂတ်ရက်ကို မရွေးပါနှင့်။'));
  const payload={id,nickname:draft.nickname.trim(),township_code:String(form.get('town')),region_code:String(form.get('region')),blood_group:draft.blood_group,manual_available:draft.manual_available,last_donation_date:last,consent_version:'v4-test'};
  const result=await supabase.from('bloodlink_profiles').upsert(payload).select().single();if(result.error)throw result.error;
  // Keep the saved profile visible to its owner if contact saving needs a retry.
  const contact=await supabase.from('bloodlink_contacts').upsert({profile_id:id,phone:draft.phone});
  if(contact.error){setVersion(v=>v+1);throw Error(txt('Profile saved, but contact could not be saved. Reload and retry. ','Profile သိမ်းပြီးပါပြီ။ ဖုန်းနံပါတ်ကို ပြန်သိမ်းပါ။ ')+contact.error.message);}
  setVersion(v=>v+1);setMessage(txt('Profile saved securely. Public search still uses fictional demo donors.','Profile သိမ်းပြီးပါပြီ။ အများရှာဖွေမှုတွင် အလှူရှင်အတုများသာ ပြထားသေးသည်။'));
 });};
 const logout=()=>run(async()=>{const {error}=await supabase.auth.signOut();if(error)throw error;change('login');});
 const remove=()=>{if(!window.confirm(txt('Delete your donor profile and demo contact? Your login account will remain.','Donor profile နှင့် ဖုန်းအတုကို ဖျက်မလား။ Login အကောင့် ကျန်ရှိမည်။')))return;run(async()=>{const result=await supabase.from('bloodlink_profiles').delete().eq('id',id).select('id');if(result.error)throw result.error;if(!result.data.length)throw Error('Profile was not deleted. Reload and try again.');setVersion(v=>v+1);setMessage(txt('Profile deleted. Your login account remains.','Profile ဖျက်ပြီးပါပြီ။ Login အကောင့် ကျန်ရှိပါသည်။'));});};
 const donate=()=>{if(!window.confirm(txt('Record a donation today and pause availability for 90 days?','ယနေ့ သွေးလှူပြီး ရက် ၉၀ ခဏနားမလား။')))return;run(async()=>{const result=await supabase.from('bloodlink_profiles').update({last_donation_date:yangonToday()}).eq('id',id).select().single();if(result.error)throw result.error;setVersion(v=>v+1);setMessage(txt('Donation recorded. Your profile remains saved.','သွေးလှူရက် မှတ်တမ်းတင်ပြီးပါပြီ။ Profile သိမ်းထားဆဲဖြစ်သည်။'));});};
 const resume=returnDate(draft.last_donation_date),paused=resume&&resume.getTime()>Date.now();
 const title=mode==='signup'?txt('Create an account','အကောင့်ဖွင့်မယ်'):mode==='forgot'?txt('Reset password by email','အီးမေးလ်ဖြင့် စကားဝှက် ပြန်သတ်မှတ်မယ်'):mode==='reset'?txt('Set a new password','စကားဝှက်အသစ် သတ်မှတ်မယ်'):txt('Log in','Login ဝင်မယ်');
 return <section className="dashboard-heading"><h1>{session&&mode!=='reset'?t.myProfile:title}</h1><p className="intro">{txt('Test stage: real email login and private cloud profile saving. Use a nickname and a DEMO phone number. Search results are still fictional.','စမ်းသပ်အဆင့် — အီးမေးလ်အစစ်ဖြင့် Login ဝင်ပြီး profile ကို သိမ်းနိုင်ပါပြီ။ နာမည်ပြောင်နှင့် DEMO ဖုန်းနံပါတ်သာ သုံးပါ။ ရှာဖွေရလဒ်များက အတုများသာ ဖြစ်သည်။')}</p>
 {error&&<p role="alert" className="auth-error">{error}</p>}{message&&<p role="status" className="auth-message">{message}</p>}
 {loading?<p role="status">{txt('Loading account…','အကောင့် ဖွင့်နေသည်…')}</p>:!session||mode==='reset'?<form className="dashboard-panel max-w-xl create-form" onSubmit={auth}><fieldset disabled={busy} className="border-0 p-0 m-0 min-w-0">
 {mode!=='reset'&&<><label htmlFor="live-email">Email</label><input id="live-email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></>}
 {mode!=='forgot'&&<><label htmlFor="live-password">{txt('Password','စကားဝှက်')}</label><input id="live-password" type="password" required minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)}/><p className="muted">{txt('Use at least 8 characters. Do not use the old demo password.','အနည်းဆုံး ၈ လုံး သုံးပါ။ Demo စကားဝှက်ဟောင်းကို မသုံးပါနှင့်။')}</p>{mode!=='login'&&<><label htmlFor="live-confirm">{txt('Confirm password','စကားဝှက် ပြန်ဖြည့်ပါ')}</label><input id="live-confirm" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></>}</>}
 <button className="primary full">{busy?txt('Please wait…','ခဏစောင့်ပါ…'):title}</button><div className="auth-links">{mode==='login'?<><button type="button" className="text-button" onClick={()=>change('signup')}>{txt('Create account','အကောင့်ဖွင့်မယ်')}</button><button type="button" className="text-button" onClick={()=>change('forgot')}>{txt('Forgot password?','စကားဝှက်မေ့နေသလား')}</button></>:<button type="button" className="text-button" onClick={()=>session?logout():change('login')}>{txt('Back to login','Login သို့ပြန်မယ်')}</button>}</div></fieldset></form>:<>
 <p>{session.user.email}</p><button className="secondary" disabled={busy} onClick={logout}>{t.logout}</button>
 {!loaded?<><p>{txt('Loading your saved profile…','Profile ဖွင့်နေသည်…')}</p><button className="secondary" onClick={()=>setVersion(v=>v+1)}>{txt('Retry','ပြန်စမ်းမယ်')}</button></>:<form className="dashboard-panel max-w-xl create-form" onSubmit={save}><fieldset disabled={busy} className="border-0 p-0 m-0 min-w-0"><h2>{exists?t.myProfile:t.createNav}</h2>
 <label htmlFor="live-nickname">{t.aliasLabel}</label><input id="live-nickname" required maxLength={50} value={draft.nickname} onChange={e=>setDraft({...draft,nickname:e.target.value})}/>
 <label htmlFor="live-phone">{t.phoneLabel}</label><input id="live-phone" required pattern="DEMO-[0-9]{4,8}" maxLength={13} value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})}/><p className="muted">{t.phoneHelp}</p>
 <LocationFields key={`${id}-${version}`} t={t} lang={lang} prefix="live" initialTown={draft.township_code}/>
 <label htmlFor="live-blood">{t.bloodLabel}</label><select id="live-blood" required value={draft.blood_group} onChange={e=>setDraft({...draft,blood_group:e.target.value})}><option value="">{t.chooseBlood}</option>{groups.map(group=><option key={group}>{group}</option>)}</select>
 <DonationHistory key={`${id}-${version}`} t={t} lang={lang} prefix="live" initial={draft.last_donation_date?draft.last_donation_date+'T12:00:00+06:30':null} now={Date.now()}/>
 <h2>{t.visibilityTitle}</h2><p className="muted">{t.visibilityHelp}</p><div className="visibility-control"><span id="live-availability">{t.searchVisibility}</span><button type="button" role="switch" aria-labelledby="live-availability" aria-checked={draft.manual_available} className="visibility-switch" data-on={draft.manual_available} onClick={()=>setDraft({...draft,manual_available:!draft.manual_available})}><span/></button></div><p className="muted">{txt('Save changes to apply this setting. Public listings will be connected in the next stage.','ဤရွေးချယ်မှုအတွက် သိမ်းမည်ကို နှိပ်ပါ။ အများရှာဖွေမှုကို နောက်အဆင့်တွင် ချိတ်ဆက်ပါမည်။')}</p>
 {paused&&<p className="pause-notice">{t.pauseAccountSafe} {t.returnDate}: {new Intl.DateTimeFormat(lang==='my'?'my-MM':'en-GB',{dateStyle:'medium',timeZone:'Asia/Yangon'}).format(resume)}</p>}
 {!exists&&<label><input type="checkbox" required/> {txt('I agree to save this test donor profile and demo contact in BloodLink.','ဤစမ်းသပ် profile နှင့် ဖုန်းအတုကို BloodLink တွင် သိမ်းရန် သဘောတူပါသည်။')}</label>}
 <button className="primary full">{busy?txt('Saving…','သိမ်းနေသည်…'):t.save}</button>
 {exists&&<><button type="button" className="secondary full mt-3" disabled={Boolean(paused)} onClick={donate}>{t.donated}</button><button type="button" className="danger full mt-3" onClick={remove}>{t.deleteButton}</button><p className="muted">{txt('Deletes your donor profile and contact, not your email login account.','Donor profile နှင့် contact ကိုသာ ဖျက်မည်။ Email login အကောင့် မဖျက်ပါ။')}</p></>}
 </fieldset></form>}</>}
 </section>;
}
