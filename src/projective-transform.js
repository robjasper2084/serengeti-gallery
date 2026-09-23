// Maps a rectangular media surface onto four measured/projected corners.
export function projectiveTransform(width,height,corners) {
 const source=[[0,0],[width,0],[width,height],[0,height]];
 const rows=source.flatMap(([x,y],i)=>{
  const [u,v]=corners[i];
  return [[x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]];
 });
 for(let col=0;col<8;col++) {
  let pivot=col;
  for(let row=col+1;row<8;row++)if(Math.abs(rows[row][col])>Math.abs(rows[pivot][col]))pivot=row;
  [rows[col],rows[pivot]]=[rows[pivot],rows[col]];
  const divisor=rows[col][col];if(Math.abs(divisor)<1e-10)return null;
  rows[col]=rows[col].map(n=>n/divisor);
  for(let row=0;row<8;row++)if(row!==col){const factor=rows[row][col];rows[row]=rows[row].map((n,i)=>n-factor*rows[col][i]);}
 }
 const [a,c,e,b,d,f,g,h]=rows.map(row=>row[8]);
 return `matrix3d(${[a,b,0,g,c,d,0,h,0,0,1,0,e,f,0,1].join(',')})`;
}
