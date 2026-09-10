import {createRoot} from 'react-dom/client';
import {App,resolvePage} from './app';
import {studioFetch,downloadStudio} from './api';
import {setContent} from '@/lib/content-store';
import {publicContent} from '@/lib/editorial-validation';
import type {ContentRecord} from '@/lib/content-types';
import '@/app/globals.css';
import {OwnerSetup} from './setup';
import {PasswordRecovery} from './recovery';
const recoveryHash=new URLSearchParams(location.hash.slice(1));
const recoveryLink=recoveryHash.get('type')==='recovery';
const recoveryFailure=recoveryHash.has('error')||recoveryHash.has('error_code');
async function boot(){
 if(location.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(location.hostname)){
  location.replace('https://'+location.host+location.pathname+location.search+location.hash);return;
 }
 const cleanUrl=new URL(location.href);
 if(/^[a-f0-9]{7}$/.test(cleanUrl.searchParams.get('v')||'')){
  cleanUrl.searchParams.delete('v');
  // Refresh the ordinary URL's browser cache, then keep the address clean.
  void fetch(cleanUrl.href,{cache:'reload'}).catch(()=>{});
  history.replaceState(history.state,'',cleanUrl.pathname+cleanUrl.search+cleanUrl.hash);
 }
 const path=window.location.pathname;const root=createRoot(document.getElementById('root')!);
 if(recoveryLink||((path.replace(/\/$/,'')==='/admin')&&(new URLSearchParams(location.search).get('recovery')==='1'||recoveryFailure))){root.render(<PasswordRecovery fromLink={recoveryLink}/>);return;}
 if(path.replace(/\/$/,'')==='/admin'){
  const incoming=new URLSearchParams(location.hash.slice(1)).get('setup');if(incoming){sessionStorage.setItem('studio-owner-setup',incoming);history.replaceState(null,'',location.pathname);}
  const token=sessionStorage.getItem('studio-owner-setup');if(token){root.render(<OwnerSetup token={token}/>);return;}
 }
 let record:ContentRecord;
 try{
  const response=await studioFetch(path.startsWith('/admin/preview/')?'/api/admin/content':'/api/content');
  if(!response.ok)throw Error('Content unavailable');record=await response.json();
 }catch{
  if(path.startsWith('/admin/preview/')){window.location.replace('/admin');return;}
  const response=await fetch('/site-content.json');record=await response.json();
 }
 if(!path.startsWith('/admin/preview/'))record={...record,data:publicContent(record.data)};
 setContent(record);
 try{const {meta}=resolvePage(path);document.title=String(meta.title||'Mirzazada Studio');}catch{}
 root.render(<App record={record} path={path}/>);
}
document.addEventListener('click',event=>{
 const link=(event.target as Element)?.closest?.('a');const href=link?.getAttribute('href');
 if(href?.startsWith('/api/admin/')){event.preventDefault();downloadStudio(href).catch(error=>alert(error.message));}
});
boot().catch(()=>{document.getElementById('root')!.textContent='The site could not load. Please refresh the page.';});
