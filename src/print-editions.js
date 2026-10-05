export const printEditions = Object.freeze([
 {id:'small',label:'5 × 7 in · print',price:25},
 {id:'medium',label:'8 × 10 in · print',price:45},
 {id:'large',label:'11 × 14 in · print',price:85},
 {id:'wall',label:'16 × 20 in · print',price:165},
 {id:'signed',label:'16 × 20 in · signed print',price:300},
 {id:'framed',label:'16 × 20 in · framed print',price:375}
]);

// Published links point to merchant-created Stripe Payment Links. Price, tax,
// shipping and fulfillment must be configured in Stripe before activation.
export function printCheckout(workId,editionId,configuration,featuredIds){
 if(!featuredIds.includes(workId)||!printEditions.some(e=>e.id===editionId))return null;
 const fulfillment=configuration?.fulfillment;
 if(configuration?.currency!=='USD'||fulfillment?.ready!==true||fulfillment.shippingReady!==true||fulfillment.webhookReady!==true)return null;
 const listing=configuration.editions?.[`${workId}:${editionId}`];
 if(listing?.sourceApproved!==true||listing.proofApproved!==true||listing.saleApproved!==true)return null;
 try{
  const url=new URL(listing.checkoutUrl);
  if(url.protocol!=='https:'||url.hostname!=='buy.stripe.com'||url.port||url.username||url.password||url.search||url.hash||!/^\/[a-zA-Z0-9]+$/.test(url.pathname)||url.pathname.startsWith('/test'))return null;
  return url.href;
 }catch{return null;}
}
