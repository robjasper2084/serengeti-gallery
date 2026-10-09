import codes from './artwork-codes.json';
import './artwork-codes.css';

export function appendArtworkCode(work){
 const code=codes.find(item=>item.id===work.id);if(!code)return;
 const section=document.createElement('section');section.className='artwork-qr';section.setAttribute('aria-label','Artwork QR code');
 const image=document.createElement('img');image.src=code.svg;image.alt=`QR code for ${work.title}`;image.width=192;image.height=192;
 const copy=document.createElement('div');
 copy.innerHTML='<h3>Take this artwork with you</h3><p>Scan to open this piece and its information on your phone.</p><div class="artwork-qr-actions"></div><p class="artwork-qr-status" role="status"></p>';
 const actions=copy.querySelector('.artwork-qr-actions');
 for(const [format,label] of [['png','Download QR'],['svg','Print-quality SVG']]){
  const link=document.createElement('a');link.href=code[format];link.download=`${work.id}-qr.${format}`;link.textContent=label;actions.append(link);
 }
 const share=document.createElement('button');share.type='button';share.textContent='Copy artwork link';
 share.onclick=async()=>{const status=copy.querySelector('.artwork-qr-status');try{await navigator.clipboard.writeText(code.url);status.textContent='Artwork link copied.';}catch{status.textContent='Copy this artwork link:';let input=copy.querySelector('input');if(!input){input=document.createElement('input');input.readOnly=true;input.setAttribute('aria-label','Artwork link');copy.append(input);}input.value=code.url;input.focus();input.select();}};
 actions.append(share);section.append(image,copy);document.querySelector('.modal-copy').append(section);
}
