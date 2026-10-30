import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seed,filterDonors,valid,recordDonation,paused,PAUSE_MS,setAvailability } from '../src/data.js';
test('only visible donors match exact township and blood group',()=>{
 const donors=seed();assert.equal(filterDonors(donors,'','').length,7);
 assert.deepEqual(filterDonors(donors,'Insein','O+').map(d=>d.id),['demo-01']);
 assert.equal(filterDonors(donors,'Hlaing','AB-').length,0);
 assert.equal(filterDonors(donors,'Tamwe','O-').length,0);
});
test('hide, edit, delete and reset produce correct search results',()=>{
 let donors=seed().map(d=>d.id==='demo-01'?{...d,visible:false}:d);
 assert.equal(filterDonors(donors,'Insein','O+').length,0);
 donors=donors.map(d=>d.id==='demo-01'?{...d,visible:true,town:'Yankin',blood:'AB-'}:d);
 assert.equal(filterDonors(donors,'Yankin','AB-').length,1);
 donors=donors.filter(d=>d.id!=='demo-01');assert.equal(filterDonors(donors,'Yankin','AB-').length,0);
 assert.equal(seed().length,8);assert.equal(seed()[0].visible,true);
});
test('saved data validation handles deletion, corruption and invalid values',()=>{
 assert.equal(valid([]),true);assert.equal(valid(seed()),true);assert.equal(valid(null),false);
 assert.equal(valid([{...seed()[0],blood:'unknown'}]),false);
 assert.equal(valid([seed()[0],seed()[0]]),false);
 assert.equal(valid([{...seed()[0],alias:'   '}]),false);
});
test('donation enforces exact 90 day pause through refresh and edits',()=>{
 const now=Date.parse('2026-10-30T12:00:00Z');
 const donor=recordDonation(seed()[0],now);
 assert.equal(donor.visible,false);
 assert.equal(paused(donor,now+PAUSE_MS-1),true);
 assert.equal(setAvailability(donor,true,now+1000).visible,false);
 const reloaded=JSON.parse(JSON.stringify({...donor,alias:'Changed',phone:'DEMO-1234'}));
 assert.equal(valid([reloaded]),true);
 assert.equal(filterDonors([{...reloaded,visible:true}],'','',now+PAUSE_MS-1).length,0);
 assert.equal(paused(reloaded,now+PAUSE_MS),false);
 assert.equal(filterDonors([reloaded],'','',now+PAUSE_MS).length,0,'manual reconfirmation required');
 assert.equal(filterDonors([setAvailability(reloaded,true,now+PAUSE_MS)],'','',now+PAUSE_MS).length,1);
});
test('legacy demo profiles migrate without losing edits and invalid new fields fail validation',()=>{
 assert.equal(valid(seed()),true);
 assert.equal(valid([{...seed()[0],phone:'09123456789'}]),false);
 assert.equal(valid([{...seed()[0],lastDonationAt:'not-a-date'}]),false);
});
