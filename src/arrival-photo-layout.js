// One image transform keeps the portrait, cinema and hit areas aligned.
export function fitArrivalPhoto(width,height,{objectFit='cover',objectPosition='50% 50%'}={}){
 const scale=(objectFit==='contain'?Math.min:Math.max)(width/1536,height/1024);
 const [px,py]=objectPosition.split(' ').map(value=>parseFloat(value)/100);
 return {scale,x:(width-1536*scale)*px,y:(height-1024*scale)*py};
}
