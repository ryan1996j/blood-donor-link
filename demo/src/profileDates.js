export const yangonToday=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Yangon',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function returnDate(value){return value?new Date(Date.parse(value+'T00:00:00+06:30')+90*86400000):null;}
