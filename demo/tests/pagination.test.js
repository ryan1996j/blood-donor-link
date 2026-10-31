import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resultWindow} from '../src/pagination.js';
import {filterDonors,seed,recordDonation} from '../src/data.js';
import {paginationDemo} from '../src/paginationDemo.js';
test('interactive demo fixture excludes its hidden and recently donated users',()=>{
 const now=Date.parse('2026-11-01T12:00:00Z');const records=paginationDemo(now);
 assert.equal(records.length,60);
 const matches=filterDonors(records,'Insein','O+',now);
 assert.equal(matches.length,58);
 assert.equal(new Set(records.map(d=>d.id)).size,60);
 assert.equal(resultWindow(matches).shown,10);
 assert.equal(resultWindow(matches,50).next,8);
 assert.equal(filterDonors(records,'Insein','A+',now).length,0);
});
test('more than 50 matching donors load ten at a time without duplicates or gaps',()=>{
 const matches=Array.from({length:58},(_,i)=>({...seed()[0],id:`large-demo-${i}`}));
 let previous=[];
 for(const count of [10,20,30,40,50,60]){
  const page=resultWindow(matches,count);
  assert.equal(page.total,58);assert.equal(page.shown,Math.min(count,58));
  assert.deepEqual(page.items.slice(0,previous.length),previous);
  assert.equal(new Set(page.items.map(d=>d.id)).size,page.shown);
  previous=page.items;
 }
 assert.equal(resultWindow(matches,50).next,8);
 assert.equal(resultWindow(matches,60).remaining,0);
});
test('empty, short, filtered and unavailable donor sets have accurate counts',()=>{
 assert.deepEqual(resultWindow([]),{items:[],total:0,shown:0,remaining:0,next:0});
 const records=[...seed(),recordDonation({...seed()[0],id:'paused'})];
 const filtered=filterDonors(records,'Insein','O+');
 const page=resultWindow(filtered);
 assert.equal(page.shown,1);assert.equal(page.remaining,0);
 assert.equal(page.items[0].id,'demo-01');
 assert.equal(resultWindow(Array.from({length:12}),10).remaining,2);
});
