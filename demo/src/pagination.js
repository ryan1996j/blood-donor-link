export const PAGE_SIZE=10;
export function resultWindow(matches,count=PAGE_SIZE){
 const limit=Math.max(PAGE_SIZE,Number.isFinite(count)?Math.floor(count):PAGE_SIZE);
 const items=matches.slice(0,limit);
 return {items,total:matches.length,shown:items.length,remaining:matches.length-items.length,next:Math.min(PAGE_SIZE,matches.length-items.length)};
}
