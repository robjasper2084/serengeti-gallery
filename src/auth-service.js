export function createAccountService(client, redirectTo) {
 const check=result=>{if(result.error)throw result.error;return result.data;};
 return {
  async signUp(email,password){return check(await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirectTo}}));},
  async signIn(email,password){return check(await client.auth.signInWithPassword({email:email.trim(),password}));},
  async reset(email){return check(await client.auth.resetPasswordForEmail(email.trim(),{redirectTo}));},
  async updatePassword(password){return check(await client.auth.updateUser({password}));},
  async signOut(){return check(await client.auth.signOut({scope:'local'}));}
 };
}
export function accountError(error){
 const code=error?.code;
 if(code==='invalid_credentials')return 'Email or password is incorrect.';
 if(code==='email_not_confirmed')return 'Confirm your email before signing in. Check your inbox and spam folder.';
 if(code==='over_email_send_rate_limit'||code==='over_request_rate_limit')return 'Too many attempts. Please wait a few minutes and try again.';
 if(code==='email_address_not_authorized')return 'Account email delivery is not ready yet. Please try again later.';
 if(code==='weak_password')return 'Please choose a stronger password with at least 12 characters.';
 return 'We could not complete that request. Please try again shortly.';
}
