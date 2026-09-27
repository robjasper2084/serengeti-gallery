// Local browsing preferences are never proof of purchase or authorization.
export function createPassport(storage,validIds,key='serengeti-passport-v1'){
 const allowed=new Set(validIds);
 let state={version:1,saved:[],rooms:[],chapters:[]};
 const clean=(items,allow)=>[...new Set(Array.isArray(items)?items.filter(x=>typeof x==='string'&&allow.has(x)):[])];
 try{const old=JSON.parse(storage.getItem(key)||'null');if(old?.version===1)state={version:1,saved:clean(old.saved,allowed),rooms:clean(old.rooms,new Set(['atrium','collection','cinema'])),chapters:clean(old.chapters,new Set(['welcome']))};}catch{}
 const persist=()=>{try{storage.setItem(key,JSON.stringify(state));return true;}catch{return false;}};
 return {
  snapshot:()=>structuredClone(state),has:id=>state.saved.includes(id),
  toggle(id){if(!allowed.has(id))throw Error('Unknown artwork');state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];return {saved:state.saved.includes(id),persisted:persist()};},
  visit(id){if(['atrium','collection','cinema'].includes(id)&&!state.rooms.includes(id)){state.rooms.push(id);persist();}},
  chapter(id){if(id==='welcome'&&!state.chapters.includes(id)){state.chapters.push(id);persist();}},
  // Explicit union, safe for retries. Only the account service may supply remote saves.
  merge(remote){state.saved=[...new Set([...state.saved,...clean(remote,allowed)])];persist();return [...state.saved];}
 };
}
