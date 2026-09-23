import {createClient} from '@supabase/supabase-js';
import {createAccountService,accountError} from './auth-service.js';
export function attachAccounts({modal,close,toast}){
 const $=s=>document.querySelector(s);
 const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
 let client,service,user=null,recovering=false;
 if(url&&key){
  client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  service=createAccountService(client,new URL(import.meta.env.BASE_URL,location.origin).href);
  client.auth.onAuthStateChange((event,session)=>{
   user=session?.user??null;
   $('#account-nav').textContent=user?'My account':'Sign in';$('#signup-nav').hidden=!!user;
   if(event==='PASSWORD_RECOVERY'){recovering=true;queueMicrotask(()=>open('password'));}
   else if(event==='SIGNED_OUT'){recovering=false;}
  });
 }
 function open(mode='signin'){
  if(!service){modal('<div class="list-panel"><h2>Accounts are coming soon</h2><p>Sign-up is being connected. You can explore the full gallery without an account.</p></div>');return;}
  if(user&&mode!=='password'){
   modal('<div class="list-panel account-panel"><div class="caption">YOUR SERENGETI ACCOUNT</div><h2>Welcome back</h2><p id="account-email"></p><p>Discoveries and chess games are saved on this browser. Cloud syncing is not enabled.</p><button class="primary" id="signout">Sign out</button><p role="status" id="account-status"></p></div>');
   $('#account-email').textContent=user.email||'Signed in';
   $('#signout').onclick=async()=>{const button=$('#signout'),status=$('#account-status');button.disabled=true;try{await service.signOut();close();toast('Signed out.');}catch(e){status.textContent=accountError(e);button.disabled=false;}};return;
  }
  const signup=mode==='signup',reset=mode==='reset',password=mode==='password';
  if(password&&(!user||!recovering)){open();return;}
  const title=signup?'Create your account':reset?'Reset your password':password?'Choose a new password':'Welcome back';
  const action=signup?'Create account':reset?'Send reset link':password?'Save password':'Sign in';
  modal(`<div class="list-panel account-panel"><div class="caption">SERENGETI GALLERY · DETROIT</div><h2>${title}</h2><form id="account-form">${password?'':'<label for="account-email-input">Email address</label><input id="account-email-input" type="email" autocomplete="email" maxlength="254" required>'}${reset?'':`<label for="account-password">${password?'New password':'Password'}</label><div class="password-field"><input id="account-password" type="password" autocomplete="${signup||password?'new-password':'current-password'}" minlength="${signup||password?12:1}" maxlength="128" required><button type="button" id="show-password" aria-pressed="false">Show</button></div>${signup||password?'<small>Use at least 12 characters.</small>':''}`}<button class="primary" id="account-submit" type="submit">${action}</button><p id="account-status" role="status" aria-live="polite"></p></form><div class="account-links">${signup||reset?'<button id="account-back">Back to sign in</button>':password?'':'<button id="account-signup">Create an account</button><button id="account-reset">Forgot password?</button>'}</div><p class="muted">The gallery is free to explore without an account.</p></div>`);
  const form=$('#account-form'),status=$('#account-status'),submit=$('#account-submit');
  $('#show-password')?.addEventListener('click',e=>{const input=$('#account-password'),show=input.type==='password';input.type=show?'text':'password';e.currentTarget.textContent=show?'Hide':'Show';e.currentTarget.setAttribute('aria-pressed',String(show));});
  $('#account-back')?.addEventListener('click',()=>open());$('#account-signup')?.addEventListener('click',()=>open('signup'));$('#account-reset')?.addEventListener('click',()=>open('reset'));
  form.onsubmit=async e=>{
   e.preventDefault();if(submit.disabled)return;submit.disabled=true;status.textContent='Please wait…';
   const email=$('#account-email-input')?.value||'',secret=$('#account-password')?.value||'';
   try{
    if(reset){await service.reset(email);status.textContent='If an account exists for this email, you will receive a password reset link.';}
    else if(password){await service.updatePassword(secret);recovering=false;close();toast('Password updated.');}
    else if(signup){const data=await service.signUp(email,secret);if(data.session){close();toast('Welcome to Serengeti Gallery.');}else status.textContent='Check your email for a confirmation link. If you already have an account, sign in or reset your password.';}
    else{await service.signIn(email,secret);close();toast('Welcome back to Serengeti Gallery.');}
   }catch(error){status.textContent=accountError(error);}
   finally{const input=form.querySelector('[type="password"],#account-password');if(input)input.value='';submit.disabled=false;}
  };
 }
 $('#account-nav').onclick=()=>open();$('#signup-nav').onclick=()=>open('signup');
 const callbackError=new URLSearchParams(location.hash.slice(1));
 if(callbackError.has('error')){history.replaceState(null,'',location.pathname+location.search);toast('That account link has expired or is invalid. Request a new link.');}
 return {open};
}
