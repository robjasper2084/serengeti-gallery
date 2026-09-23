export async function checkHeadset({secure=globalThis.isSecureContext,xr=globalThis.navigator?.xr}={}){
 if(!secure)return {supported:false,message:'Headset VR requires HTTPS or localhost. Open the secure gallery address in your headset browser.'};
 if(!xr?.isSessionSupported)return {supported:false,message:'This browser has no WebXR headset support. Open the gallery in your headset browser, or connect a supported PC VR headset.'};
 try{const supported=await xr.isSessionSupported('immersive-vr');return {supported,message:supported?'Headset available.':'No immersive VR headset is available to this browser. The desktop gallery and cinema still work.'};}catch{return {supported:false,message:'Headset access could not be checked. Check browser permissions and reconnect the headset.'};}
}
export function selectVRFilm(videoUrl,fallback){if(!videoUrl)return {url:fallback,fallback:true};try{const u=new URL(videoUrl);if(['https:','http:'].includes(u.protocol)&&/\.(mp4|webm)$/i.test(u.pathname))return {url:u.href,fallback:false};}catch{}return {url:fallback,fallback:true};}
