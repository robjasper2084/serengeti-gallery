import {fitArrivalPhoto} from './arrival-photo-layout.js';
import {readSaved} from './visitor-settings.js';
import './arrival-lights.css';

// Coordinates belong to the original 1536 × 1024 photograph. The luminance
// mask lights only photographed warm highlights inside each fixture's shape.
const fixtures=[
 ['portrait-frame',[[154,56],[478,171],[482,645],[140,660],[146,49]],12],
 ['portrait-top',[[138,14],[126,35]],28],
 ['portrait-wall',[[119,666],[178,676],[300,661],[466,651]],24],
 ['window-column',[[513,325],[515,573]],10],
 ['window-cap',[[507,0],[510,82]],16],
 ['upper-column',[[909,0],[910,91]],16],
 ['gallery-ceiling',[[912,466],[960,449],[1009,433],[1055,417]],13],
 ['gallery-wall',[[1096,326],[1099,681]],18],
 ['gallery-base',[[1092,682],[1143,682]],18],
 ['cinema-canopy',[[1100,323],[1450,286]],12],
 ['cinema-left',[[1171,366],[1173,670]],12],
 ['cinema-sign',[[1154,280],[1364,246]],58],
 ['cinema-roof',[[1125,243],[1170,225],[1282,191],[1366,170]],13],
 ['balcony',[[1123,8],[1186,38],[1314,7],[1457,0]],15],
 ['atrium-stairs',[[503,646],[539,627],[552,612],[559,594],[568,575],[610,573],[618,613]],12],
 ['cinema-stairs',[[1209,668],[1261,654],[1302,643],[1336,634],[1376,618],[1380,596]],12],
 ['cinema-lamp',[[1223,541],[1223,556]],25],
 ['gallery-lamp',[[943,549],[943,560]],24],
 ['tree-left',[[655,600],[665,574]],30],
 ['tree-right',[[827,590],[829,571]],30],
 ['planter-uplight',[[970,698],[970,676]],36],
 ['planter-rim',[[918,712],[987,707],[1036,694]],12],
 ['left-bench',[[0,790],[75,784],[147,776],[338,744]],15],
 ['right-bench',[[1350,714],[1443,742],[1536,757]],18],
 ['front-planter',[[830,879],[898,910],[994,944],[1105,980],[1188,1014]],16],
 ['far-planter',[[682,615],[719,609]],18],
 ['gallery-frame-1',[[505,497],[539,505],[539,601],[505,599]],8],
 ['gallery-frame-2',[[958,503],[977,498],[977,603],[958,601]],7],
 ['gallery-frame-3',[[992,491],[1009,484],[1009,599],[992,600]],7],
 ['gallery-frame-4',[[1023,482],[1041,472],[1041,602],[1023,601]],7],
 ['atrium-stairs',[[524,672],[559,675],[563,1024],[517,1024]],46,true],
 ['gallery-base',[[1113,697],[1137,697],[1171,821],[1129,802]],30,true],
 ['planter-uplight',[[966,723],[987,723],[999,844],[963,831]],32,true],
 ['right-bench',[[1270,701],[1299,713],[1260,816],[1210,799]],36,true],
 ['left-bench',[[34,803],[159,780],[141,874],[36,890]],28,true],
 ['portrait-wall',[[445,696],[489,687],[447,905],[413,915]],30,true],
];

export function attachArrivalLights(){
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const canvas=document.createElement('canvas');canvas.id='arrival-lights';canvas.width=768;canvas.height=512;canvas.setAttribute('aria-hidden','true');arrival.append(canvas);
 const context=canvas.getContext('2d');if(!context){canvas.remove();return;}
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let layers=[],frame=0,last=0,visible=true,ready=false,disposed=false,frames=0;
 const reduced=()=>readSaved('serengeti-reduced-motion',motion.matches)===true;
 const active=()=>ready&&!disposed&&visible&&!document.hidden&&!reduced()&&!document.body.classList.contains('exploring')&&!document.querySelector('#modal').open;
 function fit(){const {scale,x,y}=fitArrivalPhoto(arrival.clientWidth,arrival.clientHeight,getComputedStyle(image));canvas.style.transform=`translate(${x}px,${y}px) scale(${scale})`;}
 function draw(time){
  frame=0;if(!active())return;
  if(time-last>=50){
   last=time;context.clearRect(0,0,768,512);context.save();context.scale(.5,.5);
   for(const layer of layers){
    const t=time/1000,phase=layer.phase;
    // Slow, independent changes in emitted light; its reflection shares phase.
    const energy=.27+.09*Math.sin(t*.82+phase)+.035*Math.sin(t*1.67+phase*2);
    context.globalAlpha=energy*(layer.reflection ? .75 : 1);context.drawImage(layer.bloom,layer.x,layer.y);
    context.globalAlpha=energy*.48;context.drawImage(layer.core,layer.x,layer.y);
   }
   context.restore();canvas.dataset.frames=String(++frames);
  }
  frame=requestAnimationFrame(draw);
 }
 function sync(){
  cancelAnimationFrame(frame);frame=0;
  canvas.dataset.state=reduced()?'reduced':active()?'active':'paused';
  if(reduced())context.clearRect(0,0,768,512);
  if(active())frame=requestAnimationFrame(draw);
 }
 function prepare(){
  if(ready||!image.naturalWidth||disposed)return;
  try{
   const mask=document.createElement('canvas');mask.width=1536;mask.height=1024;
   const m=mask.getContext('2d',{willReadFrequently:true});m.drawImage(image,0,0,1536,1024);const pixels=m.getImageData(0,0,1536,1024);
   for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];pixels.data[i+3]=255*Math.max(0,Math.min(1,(r-145)/85))*Math.max(0,Math.min(1,(r-b-15)/75))*(g>70?1:0);}
   m.putImageData(pixels,0,0);
   const phases=new Map();
   layers=fixtures.map(([name,points,width,reflection=false])=>{
    if(!phases.has(name))phases.set(name,phases.size*2.399);
    const pad=width+20,x=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0]))-pad)),y=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1]))-pad));
    const w=Math.min(1536-x,Math.ceil(Math.max(...points.map(p=>p[0]))+pad-x)),h=Math.min(1024-y,Math.ceil(Math.max(...points.map(p=>p[1]))+pad-y));
    const core=document.createElement('canvas');core.width=w;core.height=h;const c=core.getContext('2d');
    c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.strokeStyle='white';c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px-x,py-y):c.moveTo(px-x,py-y));c.stroke();
    c.globalCompositeOperation='source-in';c.drawImage(mask,-x,-y);
    const bloom=document.createElement('canvas');bloom.width=w;bloom.height=h;const b=bloom.getContext('2d');b.filter=`blur(${reflection?9:7}px)`;b.drawImage(core,0,0);
    return {x,y,core,bloom,reflection,phase:phases.get(name)};
   });
   ready=true;canvas.dataset.fixtures=String(fixtures.filter(f=>!f[3]).length);canvas.dataset.reflections=String(fixtures.filter(f=>f[3]).length);fit();sync();
  }catch{canvas.remove();disposed=true;}
 }
 new ResizeObserver(fit).observe(arrival);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
 new MutationObserver(sync).observe(document.querySelector('#modal'),{attributes:true,attributeFilter:['open']});
 if(typeof IntersectionObserver!=='undefined')new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();}).observe(arrival);
 motion.addEventListener('change',sync);window.addEventListener('serengeti-motion',sync);document.addEventListener('visibilitychange',sync);
 window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);});window.addEventListener('pageshow',()=>{disposed=false;prepare();sync();});
 image.addEventListener('load',prepare);fit();prepare();
}
