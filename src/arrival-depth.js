import * as THREE from 'three';
// A shallow 3D relief of the supplied photograph; not a navigable reconstruction.
export function createArrivalDepth(){
 const arrival=document.querySelector('#arrival'),image=document.querySelector('#atrium-image');
 const canvas=document.createElement('canvas');canvas.id='arrival-depth';canvas.setAttribute('aria-hidden','true');image.insertAdjacentElement('afterend',canvas);
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{canvas.remove();return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.5,1.5,1,-1,.1,10);camera.position.z=3;
 const geometry=new THREE.PlaneGeometry(3,2,192,128),positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i);const foreground=Math.max(0,-y)*.22;const portrait=Math.exp(-((x+1.05)**2/.08+(y-.08)**2/.65))*.16;const tree=Math.exp(-(x*x/.12+(y-.15)**2/.8))*.09;positions.setZ(i,foreground+portrait+tree);}positions.needsUpdate=true;
 const material=new THREE.MeshBasicMaterial({transparent:true,opacity:0,toneMapped:false});scene.add(new THREE.Mesh(geometry,material));
 new THREE.TextureLoader().load(image.src,texture=>{texture.colorSpace=THREE.SRGBColorSpace;material.map=texture;material.opacity=1;material.needsUpdate=true;canvas.dataset.renderer='3D photographic relief';render();},undefined,()=>{canvas.remove();renderer.dispose();});
 let x=0,y=0,targetX=0,targetY=0,frame=0,centerX=0,centerY=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const w=arrival.clientWidth,h=arrival.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const halfHeight=Math.min(1,1.5/aspect);camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;const [px,py]=getComputedStyle(image).objectPosition.split(" ").map(v=>parseFloat(v)/100);centerX=(3-halfHeight*aspect*2)*(px-.5);centerY=-(2-halfHeight*2)*(py-.5);camera.updateProjectionMatrix();render();}
 function render(){frame=0;if(document.hidden||document.body.classList.contains('exploring'))return;x+=(targetX-x)*.08;y+=(targetY-y)*.08;camera.position.set(centerX+x,centerY+y,3);camera.lookAt(centerX,centerY,0);renderer.render(scene,camera);if(Math.abs(x-targetX)+Math.abs(y-targetY)>.0001)frame=requestAnimationFrame(render);else frame=0;}
 function request(){if(!frame)frame=requestAnimationFrame(render);}
 window.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==="touch")return;targetX=(e.clientX/innerWidth-.5)*.045;targetY=-(e.clientY/innerHeight-.5)*.03;request();},{passive:true});
 document.addEventListener('visibilitychange',request);new MutationObserver(request).observe(document.body,{attributes:true,attributeFilter:['class']});new ResizeObserver(resize).observe(arrival);resize();
}
