export const galleryPublicUrl='https://robjasper2084.github.io/serengeti-gallery/';

export function artworkPermalink(id){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))throw new Error('Invalid artwork ID');
 const url=new URL(galleryPublicUrl);url.searchParams.set('artwork',id);return url.href;
}

export function linkedArtworkIndex(search,artworks){
 const id=new URLSearchParams(search).get('artwork');
 return id===null?-1:artworks.findIndex(work=>work.id===id);
}
