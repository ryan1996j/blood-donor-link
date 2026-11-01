import React from 'react';
import {locationName,regionName,resolveTown} from './locations.js';
import {returnDate} from './profileDates.js';
export default function ProfileInfo({lang,nickname,phone,blood,town,lastDonation,visible,onEdit}){
 const txt=(en,my)=>lang==='my'?my:en;
 const resume=lastDonation?(lastDonation.length===10?returnDate(lastDonation)?.getTime():Date.parse(lastDonation)+90*86400000):null;
 const status=resume>Date.now()?txt('90-day pause','ရက် ၉၀ အနားယူနေသည်'):visible?txt('Available','သွေးလှူရန် အဆင်သင့်ရှိသည်'):txt('Resting','အနားယူနေသည်');
 const rows=[[txt('Nickname','နာမည်ပြောင်'),nickname],[txt('Phone number','ဖုန်းနံပါတ်'),phone],[txt('State / Region','တိုင်းဒေသကြီး / ပြည်နယ်'),regionName(resolveTown(town)?.region,lang)],[txt('Township','မြို့နယ်'),locationName(town,lang)],[txt('Last donation date','နောက်ဆုံး သွေးလှူခဲ့သောရက်'),lastDonation?lastDonation.slice(0,10):txt('No donation recorded','သွေးလှူမှတ်တမ်း မရှိသေးပါ')],[txt('Status','လက်ရှိအခြေအနေ'),status]];
 return <section className="profile-info"><div className="profile-info-top"><span className="blood-badge">{blood}</span><h3>{nickname}</h3></div><dl>{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><button type="button" className="primary full" onClick={onEdit}>{txt('Edit profile','Profile ပြင်မယ်')}</button></section>;
}
