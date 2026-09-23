import Stripe from 'stripe';
export function validateItems(items){
 if(!Array.isArray(items)||items.length<1||items.length>6)throw new Error('Choose between one and six editions.');
 const allowed=new Set(['archive','rhythm','grass']);const seen=new Set();
 return items.map(item=>{if(!item||!allowed.has(item.id)||!['physical','digital'].includes(item.format))throw new Error('Unknown artwork or edition.');const sku=`${item.id}_${item.format}`;if(seen.has(sku))throw new Error('Duplicate edition.');seen.add(sku);return {sku,format:item.format};});
}
export function checkoutMiddleware(env=process.env){return async(req,res,next)=>{
 if(req.url?.split('?')[0]!=='/api/checkout')return next();
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 if(req.method!=='POST')return send(405,{error:'Use POST.'});
 const origin=env.PUBLIC_ORIGIN||'http://localhost:8205';
 if(req.headers.origin!==origin)return send(403,{error:'Request origin not allowed.'});
 let body='';try{for await(const chunk of req){body+=chunk;if(body.length>8192)return send(413,{error:'Request too large.'});}const items=validateItems(JSON.parse(body).items);
 if(!env.STRIPE_RESTRICTED_KEY||env.COMMERCE_ENABLED!=='true')return send(503,{error:'Checkout is not configured. Your bag is saved; no payment has been taken.'});
 // Live mode stays locked until inventory, fulfillment, tax and shipping have been verified.
 if(!/^rk_test_/.test(env.STRIPE_RESTRICTED_KEY))return send(503,{error:'This prototype supports Stripe test mode only.'});
 const prices=items.map(x=>env[`PRICE_${x.sku.toUpperCase()}`]);if(prices.some(x=>!/^price_/.test(x||'')))return send(503,{error:'These editions are not yet available for checkout.'});
 const stripe=new Stripe(env.STRIPE_RESTRICTED_KEY);
 const session=await stripe.checkout.sessions.create({mode:'payment',integration_identifier:'serengeti_gallery_qmrtvnap',line_items:prices.map(price=>({price,quantity:1})),success_url:`${origin}/?checkout=returned`,cancel_url:`${origin}/?checkout=cancelled`,...(items.some(x=>x.format==='physical')?{shipping_address_collection:{allowed_countries:['US']}}:{})});
 return send(200,{url:session.url});
 }catch(error){return send(error.type?502:400,{error:error.type?'Payment service unavailable. Please try again.':'Invalid collection bag. Choose valid editions and try again.'});}
 };}
