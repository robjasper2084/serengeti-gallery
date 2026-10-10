// One image transform keeps the portrait, cinema and hit areas aligned.
export function fitArrivalPhoto(width,height,style={}){
 const {objectFit='cover',objectPosition='50% 50%'}=style;
 const zoom=parseFloat(style.photoZoom??style.getPropertyValue?.('--arrival-photo-zoom'))||1;
 const scale=(objectFit==='contain'?Math.min:Math.max)(width/1536,height/1024)*zoom;
 const [px,py]=objectPosition.split(' ').map(value=>parseFloat(value)/100);
 return {scale,x:(width-1536*scale)*px,y:(height-1024*scale)*py};
}
