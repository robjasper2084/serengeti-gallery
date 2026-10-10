import {fitArrivalPhoto} from './arrival-photo-layout.js';
import {readSaved} from './visitor-settings.js';
import './arrival-lights.css';

// Coordinates belong to the original 1536 × 1024 photograph. The luminance
// mask lights only photographed warm highlights inside each fixture's shape.
// Local shading and light spill make the change visible even when a source
// highlight is already near white; adding more white alone cannot do that.
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

// Light pools spread onto the surrounding stone, leaves and polished floor.
// They sit at photographed bulbs/uplights, rather than on the portrait itself.
const pools=[
 ['portrait-top',138,18,50,.65],['portrait-frame',383,119,32,1.4],
 ['portrait-wall',329,668,58,1.8],['window-column',515,435,38,.55],
 ['gallery-ceiling',945,453,35,1.3],['gallery-wall',1099,390,48,.6],
 ['gallery-base',1113,688,60,1.15],['cinema-canopy',1200,306,42,1.5],
 ['cinema-roof',1126,241,32,1.4],['balcony',1162,23,30,1.2],
 ['atrium-stairs',594,636,38,1.4],['cinema-stairs',1277,650,38,1.4],
 ['cinema-lamp',1223,548,42,1],['gallery-lamp',943,555,40,1],
 ['tree-left',655,600,76,1.2],['tree-right',829,587,68,1.2],
 ['planter-uplight',970,695,86,1.1],['left-bench',49,787,65,1.9],
 ['right-bench',1439,750,70,1.8],['front-planter',1083,981,58,1.7],
 ['atrium-stairs',550,822,37,.55,true],['gallery-base',1147,764,38,.65,true],
 ['planter-uplight',980,797,42,.7,true],['right-bench',1250,774,42,1.15,true],
 ['left-bench',87,860,45,1.1,true],['portrait-wall',449,805,38,.6,true],
];
const beams=[
 ['portrait-top',[135,28],[111,229],38],
 ['tree-left',[655,599],[709,414],48],
 ['tree-right',[829,585],[789,451],42],
 ['planter-uplight',[970,694],[952,594],35],
 ['gallery-lamp',[943,555],[948,612],27],
 ['cinema-lamp',[1223,548],[1231,603],27],
];
// Slow changes around a steady warm level; no pronounced flicker or flashing.
const lightEnergy=(t,phase)=>.68+.11*Math.sin(t*.46+phase)+.035*Math.sin(t*.83+phase*2);

export function attachArrivalLights(){
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const canvas=document.createElement('canvas');canvas.id='arrival-lights';canvas.width=768;canvas.height=512;canvas.setAttribute('aria-hidden','true');arrival.append(canvas);
 const context=canvas.getContext('2d');if(!context){canvas.remove();return;}
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let layers=[],phases=new Map(),frame=0,last=0,visible=true,ready=false,disposed=false,frames=0;
 const reduced=()=>readSaved('serengeti-reduced-motion',motion.matches)===true;
 const active=()=>ready&&!disposed&&visible&&!document.hidden&&!reduced()&&!document.body.classList.contains('exploring')&&!document.querySelector('#modal').open;
 function fit(){const {scale,x,y}=fitArrivalPhoto(arrival.clientWidth,arrival.clientHeight,getComputedStyle(image));canvas.style.transform=`translate(${x}px,${y}px) scale(${scale})`;}
 function draw(time){
  frame=0;if(!active())return;
  if(time-last>=50){
   last=time;context.clearRect(0,0,768,512);context.save();context.scale(.5,.5);
   for(const layer of layers){
    const t=time/1000,phase=layer.phase;
    // A gradual fourteen-second drift around the fixture's steady light level.
    // Every floor reflection follows the fixture that produces it.
    const energy=lightEnergy(t,phase);
    context.globalCompositeOperation='source-over';
    context.globalAlpha=(1-energy)*(layer.reflection ? .13 : .2);
    context.drawImage(layer.shade,layer.x,layer.y);
    context.globalCompositeOperation='screen';
    const shimmer=layer.reflection ? Math.sin(t*1.4+phase)*1.4 : 0;
    context.globalAlpha=energy*(layer.reflection ? .35 : .55);
    context.drawImage(layer.halo,layer.x+shimmer,layer.y);
    context.globalAlpha=energy*(layer.reflection ? .4 : .6);
    context.drawImage(layer.bloom,layer.x+shimmer*.5,layer.y);
    context.globalAlpha=energy*.4;context.drawImage(layer.core,layer.x,layer.y);
   }
   const t=time/1000;context.globalCompositeOperation='screen';
   for(const [name,x,y,radius,aspect,reflection=false]of pools){
    const phase=phases.get(name),energy=lightEnergy(t,phase);
    const spread=radius*(.65+energy*.55),drift=reflection?Math.sin(t*1.5+phase)*5:0;
    context.save();context.translate(x+drift,y);context.scale(aspect,reflection?1.65:1);
    const gradient=context.createRadialGradient(0,0,0,0,0,spread);
    gradient.addColorStop(0,'rgba(255,241,208,.92)');gradient.addColorStop(.13,'rgba(255,216,141,.7)');
    gradient.addColorStop(.4,'rgba(243,179,78,.38)');gradient.addColorStop(1,'rgba(225,151,45,0)');
    context.globalAlpha=(reflection?.2:.32)*energy;context.fillStyle=gradient;context.fillRect(-spread,-spread,spread*2,spread*2);context.restore();
   }
   context.filter='blur(8px)';
   for(const [name,start,end,width]of beams){
    const phase=phases.get(name),energy=lightEnergy(t,phase),sway=Math.sin(t*.7+phase)*5;
    const [x,y]=start,[ex,ey]=end;const gradient=context.createLinearGradient(x,y,ex+sway,ey);
    gradient.addColorStop(0,'rgba(255,227,166,.7)');gradient.addColorStop(.3,'rgba(251,199,106,.3)');gradient.addColorStop(1,'rgba(232,165,66,0)');
    context.globalAlpha=energy*.2;context.fillStyle=gradient;context.beginPath();context.moveTo(x-2,y);context.lineTo(ex+sway-width,ey);context.lineTo(ex+sway+width,ey);context.lineTo(x+2,y);context.closePath();context.fill();
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
   phases=new Map();
   layers=fixtures.map(([name,points,width,reflection=false])=>{
    if(!phases.has(name))phases.set(name,phases.size*2.399);
    const pad=width+80,x=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0]))-pad)),y=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1]))-pad));
    const w=Math.min(1536-x,Math.ceil(Math.max(...points.map(p=>p[0]))+pad-x)),h=Math.min(1024-y,Math.ceil(Math.max(...points.map(p=>p[1]))+pad-y));
    const core=document.createElement('canvas');core.width=w;core.height=h;const c=core.getContext('2d');
    c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.strokeStyle='white';c.beginPath();points.forEach(([px,py],i)=>i?c.lineTo(px-x,py-y):c.moveTo(px-x,py-y));c.stroke();
    c.globalCompositeOperation='source-in';c.drawImage(mask,-x,-y);
    const shade=document.createElement('canvas');shade.width=w;shade.height=h;const s=shade.getContext('2d');
    s.drawImage(core,0,0);s.globalCompositeOperation='source-in';s.fillStyle='#160d04';s.fillRect(0,0,w,h);
    const bloom=document.createElement('canvas');bloom.width=w;bloom.height=h;const b=bloom.getContext('2d');
    b.filter=`blur(${reflection?10:8}px) brightness(1.65)`;b.drawImage(core,0,0);
    const halo=document.createElement('canvas');halo.width=w;halo.height=h;const hctx=halo.getContext('2d');
    hctx.filter=`blur(${reflection?18:26}px) brightness(1.75)`;hctx.drawImage(core,0,0);
    return {x,y,core,shade,bloom,halo,reflection,phase:phases.get(name)};
   });
   ready=true;canvas.dataset.version='soft-light-pools-4';canvas.dataset.pools=String(pools.length);canvas.dataset.beams=String(beams.length);canvas.dataset.fixtures=String(fixtures.filter(f=>!f[3]).length);canvas.dataset.reflections=String(fixtures.filter(f=>f[3]).length);fit();sync();
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
