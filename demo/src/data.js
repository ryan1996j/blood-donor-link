export const groups = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];
export const towns = ['Insein','Hlaing','Kamayut','Sanchaung','Tamwe','Yankin'];
export const townMM = {Insein:'အင်းစိန်',Hlaing:'လှိုင်',Kamayut:'ကမာရွတ်',Sanchaung:'စမ်းချောင်း',Tamwe:'တာမွေ',Yankin:'ရန်ကင်း'};
export const seed = () => [
 {id:'demo-01',alias:'Golden Leaf',town:'Insein',blood:'O+',visible:true},
 {id:'demo-02',alias:'Morning Star',town:'Hlaing',blood:'A+',visible:true},
 {id:'demo-03',alias:'Kind Heart',town:'Kamayut',blood:'B+',visible:true},
 {id:'demo-04',alias:'Silver Moon',town:'Sanchaung',blood:'O-',visible:true},
 {id:'demo-05',alias:'Little Cloud',town:'Tamwe',blood:'AB+',visible:true},
 {id:'demo-06',alias:'Green Garden',town:'Yankin',blood:'A-',visible:true},
 {id:'demo-07',alias:'Bright River',town:'Insein',blood:'B-',visible:true},
 {id:'demo-08',alias:'Quiet Sunrise',town:'Hlaing',blood:'AB-',visible:false}
];
export const PAUSE_MS = 90 * 24 * 60 * 60 * 1000;
export const todayDate = (now=Date.now()) => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function donationDateTimestamp(value, now=Date.now()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('invalidDate');
 const stamp=Date.parse(`${value}T00:00:00+07:00`);
 if(!Number.isFinite(stamp)||todayDate(stamp)!==value||value>todayDate(now)) throw new Error('invalidDate');
 return new Date(stamp).toISOString();
}
export const paused = (donor, now=Date.now()) => Boolean(donor?.lastDonationAt && Date.parse(donor.lastDonationAt) + PAUSE_MS > now);
export const available = (donor, now=Date.now()) => Boolean(donor?.visible && !paused(donor,now));
export const recordDonation = (donor, now=Date.now()) => ({...donor, visible:false, lastDonationAt:new Date(now).toISOString()});
export const setAvailability = (donor, visible, now=Date.now()) => ({...donor,visible:Boolean(visible && !paused(donor,now))});
export const demoPhone = donor => donor.phone || `DEMO-${donor.id.replace(/\D/g,'').padStart(4,'0')}`;
export const filterDonors = (donors,town,blood,now=Date.now()) => donors.filter(d => available(d,now) && (!town || d.town===town) && (!blood || d.blood===blood));
export const valid = donors => Array.isArray(donors) && donors.length<=100 && new Set(donors.map(d=>d?.id)).size===donors.length && donors.every(d=>d && typeof d.id==='string' && typeof d.alias==='string' && d.alias.trim().length>0 && d.alias.length<=50 && towns.includes(d.town) && groups.includes(d.blood) && typeof d.visible==='boolean' && (d.phone===undefined || /^DEMO-\d{4,8}$/.test(d.phone)) && (d.lastDonationAt===undefined || (typeof d.lastDonationAt==='string' && Number.isFinite(Date.parse(d.lastDonationAt)))));
