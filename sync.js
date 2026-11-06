/* Pilot auto-sync. Dummy data only. Requires supabase/auto-sync.sql. */
(()=>{'use strict';
const STORE='counseling_studio_mockup_v1',CFG='tcs_cloud_config',EN='tcs_sync_enabled',REV='tcs_sync_rev',HASH='tcs_sync_hash',UID='tcs_sync_user';
const defaultCfg={url:'https://juwwckynlhdlqbtfbvls.supabase.co',key:'sb_publishable_ZNETi3eGQwnEoQ299F22Fw_YMcpnTcF'};
let client=null,busy=false,urgent=false,paused=false,lastState='';
const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)};
const local=()=>localStorage.getItem(STORE)||'';
const active=()=>localStorage.getItem(EN)==='1';
function status(message,mode){const el=document.getElementById('syncstatus');if(!el)return;el.textContent='☁ '+message;el.dataset.mode=mode||'';lastState=message}
function attach(){if(document.getElementById('syncstatus'))return;const n=document.createElement('div');n.id='syncstatus';n.setAttribute('role','status');n.style.cssText='font-size:11px;border:1px solid #e7dbe0;border-radius:8px;padding:6px 10px;margin-bottom:10px;color:#71344e;background:#fff;overflow-wrap:anywhere';const target=document.querySelector('.main .top');if(target)target.insertAdjacentElement('afterend',n)}
async function connect(){if(client||!window.supabase?.createClient)return client;let cfg;try{cfg=JSON.parse(localStorage.getItem(CFG)||'null')}catch{}cfg=cfg?.url&&cfg?.key?cfg:defaultCfg;client=window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function apply(payload){if(!payload||!Array.isArray(payload.clients)||!Array.isArray(payload.appointments))throw Error('Cloud payload is invalid');const str=JSON.stringify(payload);localStorage.setItem(STORE,str);if(typeof window.tcsApplyCloud==='function')window.tcsApplyCloud(payload);return str}
async function check(){
attach();
if(!active()){status('Manual cloud mode','manual');return}
if(busy)return;
if(!navigator.onLine){status('Offline · changes retained on this device','offline');return}
const db=await connect();if(!db){status('Cloud library unavailable','error');return}
busy=true;try{
const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user){status('Sign in from Settings to enable sync','error');return}
if(localStorage.getItem(UID)!==user.id){status('Auto sync belongs to another account · paused','error');return}
const rev=Number(localStorage.getItem(REV));const baseHash=localStorage.getItem(HASH);
if(!Number.isFinite(rev)||rev<1||!baseHash){status('Open Settings to initialize auto sync','error');return}
const current=local();if(!current){status('No local demo data','error');return}
const dirty=hash(current)!==baseHash;
status(dirty?'Checking before uploading…':'Checking cloud…','sync');
const {data:remote,error:headError}=await db.from('workspace_snapshots').select('revision').eq('user_id',user.id).maybeSingle();
if(headError)throw headError;
if(!remote){status('Cloud snapshot missing · sync paused','error');return}
if(Number(remote.revision)!==rev){
 if(dirty){status('CONFLICT · changes on another device. Pause sync and resolve in Settings.','conflict');return}
 const {data:row,error:downloadError}=await db.from('workspace_snapshots').select('revision,payload').eq('user_id',user.id).single();if(downloadError)throw downloadError;
 // Protect against user modifications while fetching.
 if(hash(local())!==baseHash){status('Local changes detected · retrying safely','sync');return}
 const snapshot=apply(row.payload);localStorage.setItem(REV,String(row.revision));localStorage.setItem(HASH,hash(snapshot));status('Cloud updated on this device · revision '+row.revision,'ok');return
}
if(!dirty){status('Synced · revision '+rev,'ok');return}
let payload;try{payload=JSON.parse(current)}catch{throw Error('Invalid device data')}
if(!Array.isArray(payload.clients)||!Array.isArray(payload.appointments))throw Error('Invalid workspace format');
const {data:out,error:saveError}=await db.rpc('save_workspace_if_revision',{expected_revision:rev,new_payload:payload});if(saveError)throw saveError;
const row=out?.[0];if(!row?.saved){status('CONFLICT · cloud changed before upload. Resolve in Settings.','conflict');return}
localStorage.setItem(REV,String(row.current_revision));
localStorage.setItem(HASH,hash(current));
if(local()!==current){status('Newer local edits pending · syncing next','sync');urgent=true}
else status('Saved to cloud · revision '+row.current_revision,'ok');
}catch(e){status('Sync issue: '+(e.message||String(e)),'error')}
finally{busy=false;if(urgent){urgent=false;setTimeout(check,750)}}
}
function queue(){if(!active())return;urgent=true;setTimeout(()=>{if(urgent){urgent=false;check()}},900)}
window.addEventListener('tcs-data-changed',queue);
window.addEventListener('online',check);
window.addEventListener('focus',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
window.addEventListener('storage',e=>{if(e.key===EN||e.key===REV||e.key===HASH||e.key===UID){check()}else if(e.key===STORE){if(active()&&typeof window.tcsApplyCloud==='function'){try{const payload=JSON.parse(e.newValue);window.tcsApplyCloud(payload)}catch{}}queue()}});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='tcs-cloud-updated'){if(e.data.mode==='enable'&&typeof window.tcsApplyCloud==='function'){try{window.tcsApplyCloud(JSON.parse(local()))}catch{}}check()}});
setInterval(()=>{if(!document.hidden)check()},20000);
document.addEventListener('DOMContentLoaded',()=>{attach();check()});
if(document.readyState!=='loading'){attach();check()}
})();