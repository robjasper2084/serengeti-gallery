import {isBlocked} from './collision.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

export function createGallery({artworks,onArt,toast,modalOpen,onRoom}) {
 const canvas=document.querySelector('#world'), renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.xr.enabled=true;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#78818a');scene.fog=new THREE.Fog('#8a8575',48,110);
 const camera=new THREE.PerspectiveCamera(57,innerWidth/innerHeight,.07,140);const rig=new THREE.Group();rig.add(camera);scene.add(rig);
 scene.add(new THREE.HemisphereLight('#d8e2ed','#55412d',2.0));
 const sun=new THREE.DirectionalLight('#ffdaac',3.2);sun.position.set(-12,25,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-26,right:26,top:30,bottom:-30,near:1,far:70});sun.shadow.normalBias=.045;scene.add(sun);
 const player=new THREE.Group();player.position.set(-2,0,10);scene.add(player);
 let active=false,room=0,yaw=0,pitch=.10,firstPerson=false,avatar=null,mixer=null,idle=null,walk=null,walking=false,layout=null,ready=false;
 const keys=new Set(),pickables=[],obstacles=[];const loader=new GLTFLoader(),textures=new THREE.TextureLoader();
 const gold=new THREE.MeshStandardMaterial({color:'#b89153',metalness:.78,roughness:.27});
 const glassFloor=new Reflector(new THREE.PlaneGeometry(39.6,39.6),{textureWidth:768,textureHeight:768,color:0x6b6253,clipBias:.005});glassFloor.material.transparent=true;glassFloor.material.depthWrite=false;glassFloor.material.fragmentShader=glassFloor.material.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.a = 0.24;\n#include <tonemapping_fragment>');glassFloor.rotation.x=-Math.PI/2;glassFloor.position.set(0,.008,-5);scene.add(glassFloor);
 function label(text,pos,rot=0,width=2.6,height=.30,size=28){
  const c=document.createElement('canvas');c.width=768;c.height=96;const cx=c.getContext('2d');cx.fillStyle='#eee5d1';cx.font=`${size}px Georgia`;cx.textAlign='center';cx.fillText(text.slice(0,65),384,59);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.position.set(...pos);m.rotation.y=rot;scene.add(m);return m;
 }
 async function load(){
  try{
   const [g,l,c]=await Promise.all([loader.loadAsync('/serengeti-gallery/assets/gallery.glb'),fetch('/serengeti-gallery/assets/gallery-layout.json').then(r=>r.json()),loader.loadAsync('/serengeti-gallery/assets/visitor.glb')]);layout=l;
   g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material.name==='Board-formed concrete'){o.material.roughness=.83;o.material.color.set('#b7a386');o.material.map.wrapS=o.material.map.wrapT=THREE.RepeatWrapping;} }});scene.add(g.scene);
   const invisible=new THREE.MeshBasicMaterial({visible:false});
   layout.colliders.forEach(b=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h,b.d),invisible);mesh.position.set(b.x,b.y,b.z);scene.add(mesh);obstacles.push(mesh);});
   const texturePromises=layout.slots.map(async(s,i)=>{
    const a=artworks[i];if(!a)return;const tex=await textures.loadAsync(a.image);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    const ratio=a.width&&a.height?a.width/a.height:tex.image.width/tex.image.height;let w=s.w-.05,h=w/ratio;if(h>s.h-.05){h=s.h-.05;w=h*ratio;}
    const group=new THREE.Group();group.position.set(...s.pos);group.rotation.y=s.rot;scene.add(group);
    const mount=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.h),new THREE.MeshStandardMaterial({color:'#e1d7c1',roughness:.85}));group.add(mount);
    const art=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));art.position.z=.012;art.userData.art=i;group.add(art);pickables.push(art);
    const dx=Math.sin(s.rot)*.12,dz=Math.cos(s.rot)*.12;
    label(`${String(i+1).padStart(2,'0')}  /  ${a.title}`,[s.pos[0]+dx,s.pos[1]-s.h/2-.25,s.pos[2]+dz],s.rot,s.w,.25,25);
    const lamp=new THREE.Mesh(new THREE.BoxGeometry(s.w*.66,.06,.13),new THREE.MeshBasicMaterial({color:'#ffdea5'}));lamp.position.set(0,s.h/2+.25,.22);group.add(lamp);
   });
   avatar=c.scene;avatar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});player.add(avatar);avatar.rotation.y=Math.PI;
   mixer=new THREE.AnimationMixer(avatar);idle=c.animations.find(a=>/idle/i.test(a.name));walk=c.animations.find(a=>/walk/i.test(a.name));if(idle){idle=mixer.clipAction(idle);idle.play();}if(walk){walk=mixer.clipAction(walk);walk.play();walk.setEffectiveWeight(0);}
   await Promise.all(texturePromises);ready=true;canvas.dataset.artworks=pickables.length;canvas.dataset.character='loaded';canvas.dataset.animations=c.animations.map(a=>a.name).join(',');document.querySelector('#loading').classList.add('hidden');
  }catch(e){console.error(e);document.querySelector('#loading').innerHTML='The gallery could not load.<small>Refresh to try again.</small>';}
 }
 load();
 label('S E R E N G E T I   G A L L E R Y',[0,6.6,-24.65],0,13,1,42);
 label('D E T R O I T   /   T H E   C O L L E C T I O N',[0,5.9,-24.65],0,11,.5,28);
 label('C I N E M A',[19.7,5.2,6],-Math.PI/2,4,1,45);
 for(const [x,z] of [[0,0],[-13,7],[13,-17],[-13,-17]]){const l=new THREE.PointLight('#ffc57f',40,13,2);l.position.set(x,4,z);scene.add(l);}
 const film=document.createElement('video');film.src='/serengeti-gallery/assets/serengeti-loop.mp4';film.loop=true;film.muted=true;film.playsInline=true;film.preload='auto';
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(12,5.5),new THREE.MeshBasicMaterial({map:new THREE.VideoTexture(film),side:THREE.DoubleSide}));screen.position.set(33.7,3.8,5);screen.rotation.y=-Math.PI/2;scene.add(screen);
 const screenLight=new THREE.PointLight('#d5c5a0',100,17);screenLight.position.set(31,4,5);scene.add(screenLight);
 film.onloadeddata=()=>document.querySelector('#film-state').textContent='Between concrete & grass · 5-second environmental study';
 document.querySelector('#play-film').onclick=()=>{if(film.paused)film.play().then(()=>document.querySelector('#play-film').textContent='Pause film').catch(()=>toast('Click play to start the screening.'));else{film.pause();document.querySelector('#play-film').textContent='Play film';}};
 document.querySelector('#restart-film').onclick=()=>film.currentTime=0;
 const sample=document.createElement('canvas');sample.width=sample.height=1;const cx=sample.getContext('2d',{willReadFrequently:true});let sampled=0;
 const spots=[[-2,10,0],[0,-17,0],[22,6,-Math.PI/2]];
 function go(n){room=n;active=true;keys.clear();player.position.set(spots[n][0],0,spots[n][1]);yaw=spots[n][2];if(avatar)avatar.rotation.y=yaw+Math.PI;pitch=.1;document.body.classList.add('exploring');document.querySelector('.hero').inert=true;document.querySelector('#menu').classList.add('hidden');document.querySelector('#menu-nav').setAttribute('aria-expanded','false');document.querySelector('#arrival').inert=true;document.querySelector('#cinema').classList.toggle('hidden',n!==2);onRoom(n);if(n===2)film.play().then(()=>document.querySelector('#play-film').textContent='Pause film').catch(()=>{});else film.pause();updateCamera(1);}
 function home(){active=false;keys.clear();document.body.classList.remove('exploring');document.querySelector('.hero').inert=false;document.querySelector('#arrival').inert=false;document.querySelector('#cinema').classList.add('hidden');film.pause();onRoom(-1);}
 function view(){firstPerson=!firstPerson;toast(firstPerson?'First-person view · V to see your character':'Character view · drag to look, WASD to walk');}
 function blocked(x,z){return isBlocked(layout,x,z);}
 window.addEventListener('keydown',e=>{if(!active||modalOpen()||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();keys.add(key);if(key==='v'&&!e.repeat)view();});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
 let pointer=null,moved=0;canvas.onpointerdown=e=>{if(!active||modalOpen())return;pointer=[e.clientX,e.clientY];moved=0;canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!pointer)return;const dx=e.clientX-pointer[0],dy=e.clientY-pointer[1];moved+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch+dy*.003,-.35,.75);pointer=[e.clientX,e.clientY];};
 const ray=new THREE.Raycaster();canvas.onpointerup=e=>{if(pointer&&moved<7){ray.setFromCamera(new THREE.Vector2(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2),camera);const hit=ray.intersectObjects(pickables)[0];if(hit&&hit.distance<14){const wall=ray.intersectObjects(obstacles)[0];if(!wall||wall.distance>hit.distance)onArt(hit.object.userData.art);};}pointer=null;};canvas.onpointercancel=()=>pointer=null;
 for(const [id,key] of [['forward','w'],['backward','s']]){const b=document.querySelector('#'+id);b.onpointerdown=e=>{keys.add(key);b.setPointerCapture(e.pointerId);};b.onpointerup=b.onpointercancel=()=>keys.delete(key);}
 const vr=VRButton.createButton(renderer);document.body.appendChild(vr);
 async function enterVR(){if(!navigator.xr||!await navigator.xr.isSessionSupported('immersive-vr').catch(()=>false)){toast('Connect a WebXR headset to enter VR. You can explore in 3D now.');go(0);return;}go(0);vr.click();}
 renderer.xr.addEventListener('sessionstart',()=>{camera.position.set(0,0,0);rig.position.copy(player.position);});renderer.xr.addEventListener('sessionend',()=>{rig.position.set(0,0,0);go(room);});
 for(let i=0;i<2;i++){const controller=renderer.xr.getController(i);rig.add(controller);const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(0,0,-10)]),new THREE.LineBasicMaterial({color:'#ffd490'}));controller.add(line);controller.addEventListener('selectstart',()=>{ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);ray.ray.direction.set(0,0,-1).transformDirection(controller.matrixWorld);const hit=ray.intersectObjects(pickables)[0];if(hit){toast(artworks[hit.object.userData.art].title);}else{room=(room+1)%3;player.position.set(spots[room][0],0,spots[room][1]);rig.position.copy(player.position);}});}
 function updateCamera(dt){if(renderer.xr.isPresenting)return;const target=player.position.clone().add(new THREE.Vector3(0,1.48,0));let desired;
  if(firstPerson){desired=target.clone();camera.position.copy(desired);camera.rotation.set(-pitch,yaw,0,'YXZ');}
  else{desired=target.clone().add(new THREE.Vector3(Math.sin(yaw)*4.8,1.1+pitch*4,Math.cos(yaw)*4.8));const d=desired.clone().sub(target);ray.set(target,d.clone().normalize());const wall=ray.intersectObjects(obstacles)[0];if(wall&&wall.distance<d.length())desired=target.clone().add(d.normalize().multiplyScalar(Math.max(.4,wall.distance-.2)));camera.position.lerp(desired,Math.min(1,dt*12));camera.lookAt(target);}
 }
 let last=performance.now(),hud=0;
 renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;
  const move=new THREE.Vector3();if(active&&ready&&!modalOpen()&&!renderer.xr.isPresenting){move.set(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),0,Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')));if(move.lengthSq()){move.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=keys.has('shift')?4.0:2.3;const dx=move.x*dt*speed,dz=move.z*dt*speed;if(!blocked(player.position.x+dx,player.position.z))player.position.x+=dx;if(!blocked(player.position.x,player.position.z+dz))player.position.z+=dz;if(avatar)avatar.rotation.y=Math.atan2(move.x,move.z);}}
  const moving=move.lengthSq()>0;if(moving!==walking){walking=moving;if(walk)walk.setEffectiveWeight(moving?1:0);if(idle)idle.setEffectiveWeight(moving?0:1);}mixer?.update(dt);if(avatar)avatar.visible=!firstPerson&&!renderer.xr.isPresenting;
  updateCamera(dt);
  if(now-hud>200){hud=now;canvas.dataset.position=player.position.toArray().map(v=>v.toFixed(2)).join(',');canvas.dataset.walking=walking;canvas.dataset.view=firstPerson?'first-person':'character';}
  if(room===2&&film.readyState>=2&&now-sampled>180){sampled=now;cx.drawImage(film,0,0,1,1);const c=cx.getImageData(0,0,1,1).data;screenLight.color.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace);}
  glassFloor.visible=!renderer.xr.isPresenting;
  if(active||!ready)renderer.render(scene,camera);
 });
 window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 return {go,home,view,enterVR,stop:()=>keys.clear()};
}
