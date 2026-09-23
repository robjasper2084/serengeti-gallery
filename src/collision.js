export function isBlocked(layout,x,z,radius=.34){
 if(!layout)return true;
 if(!((x>-19.5&&x<19.5&&z>-24.5&&z<14.5)||(x>=19&&x<33.5&&z>-4.5&&z<14.5)))return true;
 return layout.colliders.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius);
}
