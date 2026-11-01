export async function saveProfile(client,profile,phone){
 const {data,error}=await client.rpc('bloodlink_save_profile',{
  p_nickname:profile.nickname,p_township:profile.township_code,p_region:profile.region_code,
  p_blood:profile.blood_group,p_available:profile.manual_available,
  p_last_donation:profile.last_donation_date,p_consent_version:profile.consent_version,p_phone:phone
 });
 if(error)throw error;
 if(!data||typeof data.id!=='string'||typeof data.phone!=='string')throw new Error('Save could not be confirmed. Please reload your profile before retrying.');
 return data;
}
