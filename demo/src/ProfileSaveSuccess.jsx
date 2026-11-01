import React,{useEffect,useRef} from 'react';
export default function ProfileSaveSuccess({saved,lang,demo=false,onClose,onView,onDone=onClose}){
 const txt=(en,my)=>lang==='my'?my:en;
 const successDialog=useRef(null);
 useEffect(()=>{if(saved)successDialog.current?.showModal();else successDialog.current?.close();},[saved]);
 return ( <dialog ref={successDialog} className="success-dialog" aria-labelledby="profile-saved-title" aria-describedby="profile-saved-body" onCancel={onClose} onClose={onClose}>
 <div className="success-icon" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m5 12 4 4L19 6"/></svg></div>
 <h2 id="profile-saved-title">{saved?.created?txt('Profile created successfully','Profile ဖန်တီးပြီးပါပြီ'):txt('Changes saved successfully','ပြင်ဆင်ချက်များ သိမ်းပြီးပါပြီ')}</h2>
 <p id="profile-saved-body">{txt('Your donor profile and demo contact have been saved. You can view or edit your saved details below.','သင့်အလှူရှင် profile နှင့် ဖုန်းအတုကို သိမ်းပြီးပါပြီ။ သိမ်းထားသော အချက်အလက်များကို ပြန်ကြည့်နိုင်ပြီး ပြင်ဆင်နိုင်ပါသည်။')}</p>
 <p className="profile-save-note">{demo?txt('Demo only. Your profile is saved in this browser; no data is sent to a database.','Demo သာဖြစ်သည်။ Profile ကို ဤ browser ထဲတွင်သာ သိမ်းထားပြီး database သို့ မပို့ပါ။'):txt('Your cloud profile is private during this test stage. Public search still shows fictional donors.','ဤစမ်းသပ်အဆင့်တွင် သင့် cloud profile ကို သင်သာ မြင်နိုင်ပါသည်။ အများရှာဖွေမှုတွင် အလှူရှင်အတုများသာ ပြထားသေးသည်။')}</p>
 <div className="dialog-actions"><button type="button" className="primary" autoFocus onClick={onView}>{txt('View my saved profile','သိမ်းထားသော profile ကြည့်မယ်')} <span aria-hidden="true">→</span></button><button type="button" className="secondary" onClick={onDone}>{txt('Done','ပြီးပါပြီ')}</button></div>
 </dialog>);
}
