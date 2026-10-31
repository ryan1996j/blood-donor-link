import {resolveTown} from './locations.js';
export function paginationDemo(now=Date.now()){
 const location=resolveTown('Insein');
 const profile=i=>({id:`pagination-fixture-${i}`,alias:`Demo Donor ${String(i).padStart(3,'0')}`,phone:`DEMO-${String(i).padStart(4,'0')}`,town:location.id,region:location.region,blood:'O+',visible:true});
 return [...Array.from({length:58},(_,i)=>profile(i+1)),{...profile(59),visible:false},{...profile(60),lastDonationAt:new Date(now).toISOString()}];
}
