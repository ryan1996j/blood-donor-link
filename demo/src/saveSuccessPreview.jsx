import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import ProfileSaveSuccess from './ProfileSaveSuccess.jsx';
import './style.css';
function Preview(){
 const [saved,setSaved]=useState(null),[lang,setLang]=useState('en');
 return <><div className="demo-banner">{lang==='my'?'ကွန်ပျူတာတွင်း UI စမ်းသပ်မှု · ဒေတာအတုသာ · Database မပြောင်းပါ':'LOCAL UI PREVIEW · Fake data only · No database writes'}</div><main className="shell" style={{paddingTop:32}}><div className="panel-heading"><h1 style={{fontSize:32}}>{lang==='my'?'Profile သိမ်းခြင်း စမ်းသပ်မယ်':'Profile save preview'}</h1><button className="language" onClick={()=>setLang(lang==='en'?'my':'en')}>{lang==='en'?'မြန်မာ':'English'}</button></div><section className="dashboard-panel max-w-xl"><h2>Golden Leaf</h2><p>O+ · Insein · DEMO-1234</p><p className="muted">{lang==='my'?'Profile ဖန်တီးပြီး သို့မဟုတ် ပြင်ပြီးနောက် အောင်မြင်ကြောင်း message ကို စမ်းပါ။ Supabase သို့ မချိတ်ဆက်ပါ။':'Preview the confirmation after creating or editing a profile. This page never connects to Supabase.'}</p><button className="primary full" onClick={()=>setSaved({created:true})}>{lang==='my'?'Profile အသစ်သိမ်းခြင်း စမ်းမယ်':'Preview: Save new profile'}</button><button className="secondary full mt-3" onClick={()=>setSaved({created:false})}>{lang==='my'?'ပြင်ဆင်ချက် သိမ်းခြင်း စမ်းမယ်':'Preview: Save changes'}</button></section><ProfileSaveSuccess demo saved={saved} lang={lang} onClose={()=>setSaved(null)} onView={()=>setSaved(null)}/></main></>;
}
createRoot(document.getElementById('root')).render(<Preview/>);
