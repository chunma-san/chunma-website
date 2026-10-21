import { safeMedia, safeURL } from './library.mjs';
import { novels } from './novels.mjs';
const $ = s => document.querySelector(s);
let projects = [], tab = 'novel';
let librarySource = 'Local import';
let library = { anime: [], manga: [] };
try { const saved = JSON.parse(localStorage.getItem('sanctuary-safe-library-v1') || '{}'); for (const kind of ['anime','manga']) library[kind] = (saved[kind] || []).filter(x => safeMedia(x.media, kind)); } catch {}
function node(tag, text, className) { const n = document.createElement(tag); if(text !== undefined) n.textContent=text; if(className)n.className=className; return n; }
function renderProjects() {
 const query = $('#project-search').value.toLowerCase(); const rows = projects.filter(p => (p.name+' '+(p.description||'')+' '+(p.language||'')).toLowerCase().includes(query));
 $('#project-count').textContent = rows.length+' public projects'; $('#project-grid').replaceChildren();
 for(const p of rows) { const a=node('a',undefined,'project-card'); a.href=safeURL(p.html_url);a.target='_blank';a.rel='noopener';
  const top=node('div',undefined,'top');top.append(node('span','⌘'),node('span','↗'));a.append(top,node('h3',p.name),node('p',p.description||'A public project. Explore the repository to learn more.'));
  const meta=node('div',undefined,'project-meta');const lang=node('span');lang.append(node('i'),document.createTextNode(p.language||'Source'));meta.append(lang);if(p.fork)meta.append(node('span','Fork'));a.append(meta);$('#project-grid').append(a);
 }
 if(!rows.length) $('#project-grid').append(node('p','No projects match your search.','muted'));
}
async function loadProjects(){
 try { const response=await fetch('projects.json');if(!response.ok)throw Error();projects=await response.json();renderProjects(); }catch{$('#project-status').textContent='Projects are temporarily unavailable. Open GitHub to browse the full list.';}
 try { let all=[];for(let page=1;page<=10;page++){const response=await fetch('https://api.github.com/users/chunma-san/repos?type=owner&sort=updated&per_page=100&page='+page);if(!response.ok)throw Error();const rows=await response.json();if(!Array.isArray(rows))throw Error();all.push(...rows.filter(r=>!r.private&&r.owner?.login?.toLowerCase()==='chunma-san'));if(rows.length<100)break;} projects=all;renderProjects();$('#project-status').textContent='Live from GitHub · New public projects appear automatically.';}catch{$('#project-status').textContent='Showing the saved public-project directory. Live updates will retry on your next visit.';}
}
function renderLibrary(){
 $('#connect-open').hidden=tab==='novel';
 $('#library-cards').classList.toggle('novel-grid',tab==='novel');
 if(tab==='novel'){
  $('#library-empty').hidden=true;$('#library-stats').hidden=false;$('#library-stats').replaceChildren();$('#library-cards').replaceChildren();
  const count=node('span');count.append(node('b',String(novels.length)),document.createTextNode('Novels'));$('#library-stats').append(count);
  for(const novel of novels){
   const card=node('a',undefined,'media-card');card.href=novel.url;card.target='_blank';card.rel='noopener noreferrer';
   const cover=node('img');cover.src=novel.cover;cover.alt=novel.title;cover.loading='lazy';cover.width=400;cover.height=600;
   card.append(cover,node('h3',novel.title),node('small','Read on Webnovel ↗'));$('#library-cards').append(card);
  }
  $('#library-status').textContent='';return;
 }
 const rows=library[tab].filter(x=>safeMedia(x.media,tab));$('#library-empty').hidden=rows.length>0;$('#library-cards').replaceChildren();$('#library-stats').hidden=!rows.length;$('#library-stats').replaceChildren();
 if(rows.length){const total=rows.reduce((n,r)=>n+(Number(r.progress)||0),0);for(const [value,label] of [[rows.length,tab==='anime'?'Visible anime':'Visible manga'],[total,tab==='anime'?'Episodes watched':'Chapters read']]){const s=node('span');s.append(node('b',String(value)),document.createTextNode(label));$('#library-stats').append(s);}}
 for(const row of rows){const m=row.media,a=node('a',undefined,'media-card');a.href=safeURL(m.url);a.target='_blank';a.rel='noopener';const img=node('img');img.src=safeURL(m.images?.webp?.large_image_url||m.images?.jpg?.large_image_url||'');img.alt=m.title_english||m.title||'';img.loading='lazy';img.referrerPolicy='no-referrer';a.append(img,node('h3',m.title_english||m.title),node('small',row.status+' · '+row.progress+' '+(tab==='anime'?'episodes':'chapters')));$('#library-cards').append(a);}
 $('#library-status').textContent=rows.length?librarySource+' · '+rows.length+' titles · All ratings and genres included.':'';
}
const dialog=$('#connect-dialog');for(const id of ['connect-open','empty-connect'])$('#'+id).onclick=()=>dialog.showModal();
$('#project-search').addEventListener('input',renderProjects);
for(const button of document.querySelectorAll('[data-tab]'))button.onclick=()=>{tab=button.dataset.tab;for(const b of document.querySelectorAll('[data-tab]')){b.classList.toggle('active',b===button);b.setAttribute('aria-selected',String(b===button));}renderLibrary();};
function setMAL(){const username=$('#mal-user').value.trim();if(!/^[a-zA-Z0-9_-]{1,80}$/.test(username))return;try{localStorage.setItem('sanctuary-mal-user',username);}catch{}$('#mal-link').href='https://myanimelist.net/profile/'+encodeURIComponent(username);$('#mal-link').target='_blank';$('#mal-link').rel='noopener';$('#mal-label').textContent='@'+username;}
$('#mal-user').addEventListener('change',setMAL);try{$('#mal-user').value='chu_n_ma';setMAL();}catch{}
let importing=false;
async function checkedFetch(url){for(let retry=0;retry<3;retry++){const response=await fetch(url);if(response.status===429){await new Promise(r=>setTimeout(r,2500));continue;}if(!response.ok)throw Error('Metadata unavailable');return (await response.json()).data;}throw Error('Service rate limit');}
$('#xml-file').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file||importing)return;if(file.size>10*1024*1024){$('#import-status').textContent='Please select an XML file smaller than 10 MB.';return;}
 const source=await file.text();if(/<!DOCTYPE|<!ENTITY/i.test(source)){$('#import-status').textContent='This XML contains unsupported document declarations.';return;}const xml=new DOMParser().parseFromString(source,'application/xml');if(xml.querySelector('parsererror')||!xml.querySelector('myanimelist')){$('#import-status').textContent='This is not a valid MAL XML export. Unzip the export first.';return;}
 const kind=xml.querySelector('anime')?'anime':xml.querySelector('manga')?'manga':null;if(!kind){$('#import-status').textContent='No anime or manga entries were found.';return;}
 const entries=[...xml.querySelectorAll('myanimelist > '+kind)],accepted=[];let checked=0,hidden=0,unavailable=0;importing=true;$('#xml-file').disabled=true;setMAL();
 for(const entry of entries){const id=entry.querySelector(kind==='anime'?'series_animedb_id':'manga_mangadb_id')?.textContent;if(!/^\d+$/.test(id||'')){unavailable++;continue;}
  $('#import-status').textContent='Loading title metadata… '+checked+' / '+entries.length+'. You can close this dialog; keep the page open.';
  try {const media=await checkedFetch('https://api.jikan.moe/v4/'+kind+'/'+id+'/full');if(safeMedia(media,kind)){accepted.push({media,progress:Number(entry.querySelector(kind==='anime'?'my_watched_episodes':'my_read_chapters')?.textContent)||0,status:entry.querySelector('my_status')?.textContent||'In my list'});}else hidden++;}catch{unavailable++;}checked++;await new Promise(r=>setTimeout(r,420));
 }
 librarySource='Local import';library[kind]=accepted;try{localStorage.setItem('sanctuary-safe-library-v1',JSON.stringify(library));}catch{$('#library-status').textContent='Library loaded for this visit; browser storage is full.';}tab=kind;for(const b of document.querySelectorAll('[data-tab]')){b.classList.toggle('active',b.dataset.tab===kind);b.setAttribute('aria-selected',String(b.dataset.tab===kind));}renderLibrary();$('#import-status').textContent=accepted.length+' titles imported. '+hidden+' invalid metadata entries skipped. '+unavailable+' could not be verified and were not displayed.';importing=false;$('#xml-file').disabled=false;
});
$('#clear-library').onclick=()=>{library={anime:[],manga:[]};try{localStorage.removeItem('sanctuary-safe-library-v1');}catch{}$('#import-status').textContent='Local library cleared.';renderLibrary();};
loadProjects();renderLibrary();

async function loadPublicLibrary(){
 if(tab!=='novel')$('#library-status').textContent='Loading @chunma from AniList…';
 const query=`query($type:MediaType!){MediaListCollection(userName:"chunma",type:$type){lists{entries{status progress media{id idMal title{romaji english native} siteUrl coverImage{large}}}}}}`;
 let loaded=0;
 for(const [kind,type] of [['anime','ANIME'],['manga','MANGA']]){
  try{
   const response=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables:{type}})});
   if(!response.ok)throw Error();const body=await response.json();if(body.errors||!body.data?.MediaListCollection)throw Error();
   const seen=new Set();library[kind]=body.data.MediaListCollection.lists.flatMap(l=>l.entries).filter(e=>{if(seen.has(e.media.id))return false;seen.add(e.media.id);return true;}).map(e=>({media:{mal_id:e.media.idMal||e.media.id,title:e.media.title.romaji||e.media.title.english||e.media.title.native,url:e.media.siteUrl,images:{jpg:{large_image_url:e.media.coverImage.large}}},progress:e.progress,status:e.status.replaceAll('_',' ').toLowerCase()})).filter(e=>safeMedia(e.media,kind));
   loaded++;librarySource='Live AniList · @chunma';renderLibrary();
  }catch{}
 }
 if(!loaded&&tab!=='novel')$('#library-status').textContent='AniList could not be loaded. Visit @chunma on AniList or import a MAL XML export. Retry by refreshing this page.';
}
loadPublicLibrary();

async function loadDiscordPresence(){
 const label=document.querySelector('#discord-status');
 const states={online:'Online',idle:'Idle',dnd:'Do not disturb',offline:'Offline'};
 try{
  const response=await fetch('https://api.lanyard.rest/v1/users/891081797318897715',{signal:AbortSignal.timeout(10000),cache:'no-store',credentials:'omit'});
  if(!response.ok)throw Error();const body=await response.json();
  const status=body.data?.discord_status;
  if(!body.success||body.data?.discord_user?.id!=='891081797318897715'||!Object.hasOwn(states,status))throw Error();
  label.dataset.presence=status;label.textContent=states[status];label.title='Discord presence via Lanyard · refreshes every 30 seconds';
 }catch{label.dataset.presence='unknown';label.textContent='Status unavailable';label.title='Discord presence could not be refreshed';}
}
loadDiscordPresence();
setInterval(()=>{if(!document.hidden)loadDiscordPresence();},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadDiscordPresence();});
