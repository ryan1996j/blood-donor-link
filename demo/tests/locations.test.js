import {test} from 'node:test';
import assert from 'node:assert/strict';
import {regions,townships,resolveTown,migrateLocations,validLocation} from '../src/locations.js';
import {seed,valid,filterDonors} from '../src/data.js';
test('snapshot has unique codes and every township belongs to a valid region',()=>{
 assert.equal(regions.length,15);assert.equal(townships.length,330);
 assert.equal(new Set(townships.map(t=>t.id)).size,330);
 for(const t of townships){assert.ok(regions.some(r=>r.id===t.region));assert.ok(t.en&&t.my);}
});
test('migration preserves all saved fields and maps legacy spelling to the correct code',()=>{
 const old=seed().map(d=>({...d,phone:'DEMO-1234',lastDonationAt:'2026-10-01T00:00:00Z'}));
 const migrated=migrateLocations(old);
 assert.equal(valid(migrated),true);
 old.forEach((d,i)=>{assert.equal(migrated[i].alias,d.alias);assert.equal(migrated[i].visible,d.visible);assert.equal(migrated[i].phone,d.phone);assert.equal(migrated[i].lastDonationAt,d.lastDonationAt);});
 assert.equal(resolveTown('Kamayut').id,resolveTown('Kamaryut').id);
 assert.equal(filterDonors(migrateLocations(seed()),'Insein','O+').length,1);
 assert.equal(filterDonors(migrateLocations(seed()),resolveTown('Insein').id,'O+').length,1);
 assert.deepEqual(migrateLocations(migrated),migrated);
});
test('cross-region and unknown township combinations are rejected',()=>{
 const town=resolveTown('Insein');
 assert.equal(validLocation(town.id,'MMR013'),true);
 assert.equal(validLocation(town.id,'MMR001'),false);
 assert.equal(validLocation('not-a-town','MMR001'),false);
 assert.equal(valid([{...seed()[0],town:town.id,region:'MMR001'}]),false);
});
