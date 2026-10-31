export const DEMO_PASSWORD='demo-only-123';
export const isDemoEmail=value=>/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.test$/i.test(value.trim());
export const initialAccounts=()=>Array.from({length:8},(_,i)=>({id:`demo-${String(i+1).padStart(2,'0')}`,email:`donor${i+1}@example.test`,verified:true}));
export function loadAccounts(donors=[]){
 let accounts=initialAccounts();
 try{const data=JSON.parse(localStorage.getItem('bloodlink-demo-accounts-v1'));if(Array.isArray(data)&&data.every(a=>typeof a.id==='string'&&typeof a.email==='string'&&isDemoEmail(a.email)&&typeof a.verified==='boolean'))accounts=data;}catch{}
 for(const donor of donors){if(!accounts.some(a=>a.id===donor.id)){let index=accounts.length+1;while(accounts.some(a=>a.email===`donor${index}@example.test`))index++;accounts.push({id:donor.id,email:`donor${index}@example.test`,verified:true});}}
 return accounts;
}
