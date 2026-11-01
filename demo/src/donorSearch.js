export async function searchPage(client,filters={},after=null){
 const {data,error}=await client.rpc('bloodlink_search_donors',{p_region:filters.region||null,p_township:filters.town||null,p_blood:filters.blood||null,p_after:after});
 if(error)throw error;
 const rows=data||[],items=rows.slice(0,10);
 return {items,more:rows.length>10,cursor:items.at(-1)?.id||null};
}
export async function openDonor(client,id){
 const {data,error}=await client.rpc('bloodlink_open_donor',{p_id:id});
 if(error)throw error;
 return data?.[0]||null;
}
