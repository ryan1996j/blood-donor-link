import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEMO_PASSWORD,isDemoEmail,initialAccounts,loadAccounts} from '../src/demoAccounts.js';
test('demo credentials permit fictional addresses and reject real email domains',()=>{
 assert.ok(isDemoEmail('donor1@example.test'));
 assert.ok(isDemoEmail('Test.User@bloodlink.test'));
 assert.equal(isDemoEmail('person@gmail.com'),false);
 assert.equal(isDemoEmail('person@outlook.com'),false);
 assert.equal(isDemoEmail('invalid'),false);
 assert.equal(DEMO_PASSWORD,'demo-only-123');
});
test('each original demo account maps to exactly one seed profile with no password storage',()=>{
 const accounts=initialAccounts();
 assert.equal(new Set(accounts.map(a=>a.email)).size,8);
 assert.equal(new Set(accounts.map(a=>a.id)).size,8);
 assert.equal(accounts[0].id,'demo-01');
 assert.equal(accounts[0].email,'donor1@example.test');
 for(const account of accounts){assert.equal('password' in account,false);assert.equal(account.verified,true);}
});
test('existing custom demo profiles are given recoverable fictional email mappings',()=>{
 const accounts=loadAccounts([{id:'existing-custom-profile'}]);
 assert.ok(accounts.some(a=>a.id==='existing-custom-profile'&&isDemoEmail(a.email)));
});
