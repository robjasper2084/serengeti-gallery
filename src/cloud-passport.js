export function createCloudPassport(client,userId){
 const check=r=>{if(r.error)throw r.error;return r.data;};
 return {
  async list(){return check(await client.from('saved_artworks').select('artwork_id').eq('user_id',userId)).map(x=>x.artwork_id);},
  async listProgress(){return check(await client.from('passport_progress').select('kind,item_id').eq('user_id',userId));},
  async save(artwork_id){check(await client.from('saved_artworks').upsert({user_id:userId,artwork_id},{onConflict:'user_id,artwork_id',ignoreDuplicates:true}));},
  async remove(id){check(await client.from('saved_artworks').delete().eq('user_id',userId).eq('artwork_id',id));},
  async progress(kind,item_id){check(await client.from('passport_progress').upsert({user_id:userId,kind,item_id},{onConflict:'user_id,kind,item_id',ignoreDuplicates:true}));}
 };
}
