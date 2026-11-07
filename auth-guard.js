/* UI access gate only. LocalStorage remains unencrypted, NOT production security. */
(()=>{'use strict';
const PROJECT={url:'https://juwwckynlhdlqbtfbvls.supabase.co',key:'sb_publishable_ZNETi3eGQwnEoQ299F22Fw_YMcpnTcF'};
let authClient=null;
const gate=()=>document.getElementById('authgate');
const message=t=>{const el=document.getElementById('authmessage');if(el)el.textContent=t};
async function verify(){
 if(!window.supabase?.createClient){message('Login service unavailable. Check your connection and try again.');return}
 try{
  if(!authClient)authClient=window.supabase.createClient(PROJECT.url,PROJECT.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data,error}=await authClient.auth.getUser();
  if(error||!data?.user){document.body.classList.remove('tcs-authorized');message('Sign in with your Supabase account from Cloud Setup, then return here.');return}
  document.body.classList.add('tcs-authorized');const el=gate();if(el)el.setAttribute('aria-hidden','true');
 }catch(e){message('Authentication could not be verified: '+(e.message||'Please retry'))}
}
window.tcsVerifyAccess=verify;
document.addEventListener('visibilitychange',()=>{if(!document.hidden)verify()});
window.addEventListener('focus',verify);
window.addEventListener('pageshow',verify);
document.addEventListener('DOMContentLoaded',verify);
if(document.readyState!=='loading')verify();
})();