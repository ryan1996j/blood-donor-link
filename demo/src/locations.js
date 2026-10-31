import source from './locations.json' with {type:'json'};
// Source keeps Bago and Shan sub-regions separate. Group them in the UI,
// retaining original township Pcodes and source region codes in the snapshot.
const groupRegion=id=>({'MMR008':'MMR007','MMR015':'MMR014','MMR016':'MMR014'}[id]||id);
const regionLabelsMy={
 MMR001:'ကချင်ပြည်နယ်',
 MMR002:'ကယားပြည်နယ်',
 MMR003:'ကရင်ပြည်နယ်',
 MMR004:'ချင်းပြည်နယ်',
 MMR011:'မွန်ပြည်နယ်',
 MMR012:'ရခိုင်ပြည်နယ်',
 MMR014:'ရှမ်းပြည်နယ်',
 MMR005:'စစ်ကိုင်းတိုင်းဒေသကြီး',
 MMR006:'တနင်္သာရီတိုင်းဒေသကြီး',
 MMR007:'ပဲခူးတိုင်းဒေသကြီး',
 MMR009:'မကွေးတိုင်းဒေသကြီး',
 MMR010:'မန္တလေးတိုင်းဒေသကြီး',
 MMR013:'ရန်ကုန်တိုင်းဒေသကြီး',
 MMR017:'ဧရာဝတီတိုင်းဒေသကြီး'
};
export const regions=source.regions.filter(r=>groupRegion(r.id)===r.id).map(r=>{
 const grouped=r.id==='MMR007'?{...r,en:'Bago',my:'ပဲခူး'}:r.id==='MMR014'?{...r,en:'Shan',my:'ရှမ်း'}:r;
 return {...grouped,my:regionLabelsMy[r.id]||grouped.my};
});
export const townships=source.townships.map(t=>({...t,region:groupRegion(t.region)}));
const legacyAliases={Kamayut:'Kamaryut'};
export const resolveTown=value=>townships.find(t=>t.id===value)||townships.find(t=>t.en===(legacyAliases[value]||value));
export const locationName=(value,lang='en')=>{const item=resolveTown(value);return item?.[lang==='my'?'my':'en']||value;};
export const regionName=(value,lang='en')=>regions.find(r=>r.id===value)?.[lang==='my'?'my':'en']||value;
export const validLocation=(town,region)=>Boolean(resolveTown(town)&&(!region||resolveTown(town).region===region));
export const migrateLocations=donors=>donors.map(d=>{const town=resolveTown(d.town);return town?{...d,town:town.id,region:town.region}:d;});
