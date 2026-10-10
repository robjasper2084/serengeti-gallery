import {readFile,writeFile,mkdir} from 'node:fs/promises';
import QRCode from 'qrcode';
import {Resvg} from '@resvg/resvg-js';
import {artworkPermalink} from '../src/artwork-links.js';

const root=new URL('../',import.meta.url);
const submissions=JSON.parse(await readFile(new URL('src/gallery-submissions.json',root),'utf8'));
const exhibition=JSON.parse(await readFile(new URL('src/life-and-light.json',root),'utf8'));
const additions=JSON.parse(await readFile(new URL('src/new-artworks.json',root),'utf8'));
const works=[{id:'archive',title:'The Living Portrait'},...submissions,...exhibition,...additions];
const directory=new URL('public/assets/artwork-codes/',root);
await mkdir(directory,{recursive:true});
const codes=[];
for(const {id,title} of works){
 const url=artworkPermalink(id);
 const svg=await QRCode.toString(url,{type:'svg',errorCorrectionLevel:'Q',margin:4,width:384,color:{dark:'#000000ff',light:'#ffffffff'}});
 await writeFile(new URL(`${id}.svg`,directory),svg);
 await writeFile(new URL(`${id}.png`,directory),new Resvg(svg).render().asPng());
 codes.push({id,title,url,png:`/serengeti-gallery/assets/artwork-codes/${id}.png`,svg:`/serengeti-gallery/assets/artwork-codes/${id}.svg`});
}
await writeFile(new URL('src/artwork-codes.json',root),JSON.stringify(codes,null,2)+'\n');
console.log(`Created ${codes.length} artwork QR codes as PNG and SVG.`);
