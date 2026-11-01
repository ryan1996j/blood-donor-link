import {test} from 'node:test';
import assert from 'node:assert/strict';
import {yangonToday,returnDate} from '../src/profileDates.js';
test('live donation dates use Yangon midnight, including the Bangkok date boundary',()=>{
 assert.equal(yangonToday(Date.parse('2026-11-01T17:15:00Z')),'2026-11-01');
 assert.equal(yangonToday(Date.parse('2026-11-01T17:30:00Z')),'2026-11-02');
});
test('live recovery ends at Yangon midnight on day 90 across year and leap boundaries',()=>{
 assert.equal(returnDate('2026-11-01').toISOString(),'2027-01-29T17:30:00.000Z');
 assert.equal(yangonToday(returnDate('2024-02-01')),'2024-05-01');
 assert.equal(returnDate(null),null);
});
