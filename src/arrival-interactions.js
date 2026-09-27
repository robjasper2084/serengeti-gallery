export function attachArrivalInteractions({enterGallery}){
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const entrance=document.createElement('button');entrance.id='arrival-enter';entrance.className='scene-hotspot entrance-hotspot';entrance.setAttribute('aria-label','Walk into the gallery');entrance.innerHTML='<span>Enter gallery ↗</span>';entrance.onclick=enterGallery;arrival.append(entrance);
 const portrait=document.querySelector('#portrait-info'),cinema=document.querySelector('#watch');
 portrait.querySelector('span').textContent='Meet the portrait ↗';
 cinema.querySelector('span').textContent='Enter cinema ↗';
 // Anchor hit areas to the actual cover-cropped photograph at every screen size.
 const areas=[[portrait,[160,145,315,500]],[entrance,[510,330,370,330]],[cinema,[1110,280,335,405]]];
 function fit(){const w=arrival.clientWidth,h=arrival.clientHeight,s=Math.max(w/1536,h/1024);const [px,py]=getComputedStyle(image).objectPosition.split(' ').map(v=>parseFloat(v)/100);const ox=(w-1536*s)*px,oy=(h-1024*s)*py;for(const [button,[x,y,width,height]]of areas){Object.assign(button.style,{left:`${ox+x*s}px`,top:`${oy+y*s}px`,width:`${width*s}px`,height:`${height*s}px`,right:'auto'});}}
 new ResizeObserver(fit).observe(arrival);image.addEventListener('load',fit);fit();
 const quick=document.createElement('nav');quick.id='arrival-quick';quick.setAttribute('aria-label','Explore the scene');
 for(const [text,target]of [['Portrait',portrait],['Enter gallery',entrance],['Cinema',cinema]]){const b=document.createElement('button');b.textContent=text;b.onclick=()=>target.click();quick.append(b);}
 arrival.append(quick);
}
