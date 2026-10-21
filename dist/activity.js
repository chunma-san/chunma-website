import {summarize} from './activity-data.mjs';
const root = document.querySelector('#github-activity');
const $ = selector => root.querySelector(selector);
const owner = 'chunma-san';
const cacheKey = 'chunma-github-activity-v1';
const node = (tag, text, className) => { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(className)e.className=className; return e; };
function bars(target, days, keys, label) {
  target.replaceChildren();
  const max = Math.max(1,...days.flatMap(d=>keys.map(k=>d[k])));
  for (const d of days) {
    const group=node('div',undefined,'activity-day');
    const values=keys.map(k=>d[k]);
    group.title=d.date+' UTC · '+keys.map((k,i)=>k+': '+values[i]).join(' · ');
    for (let i=0;i<keys.length;i++) {
      const bar=node('span',undefined,'activity-bar series-'+i);
      // Discrete heights keep charts compatible with the strict CSP (no inline styles).
      bar.classList.add('bar-'+Math.round(values[i]/max*20));
      group.append(bar);
    }
    target.append(group);
  }
  target.setAttribute('aria-label',label+'. '+days.map(d=>d.date+': '+keys.map(k=>d[k]).join('/')).join('; '));
}
function render(data, label) {
  const {days,totals}=summarize(data.events);
  $('#activity-total').textContent=totals.total.toLocaleString()+' public events · last 30 UTC days';
  $('#activity-repos').textContent=data.repositories+' public repositories · '+label;
  $('#activity-issues-total').textContent=totals.issuesOpened+' opened / '+totals.issuesClosed+' closed';
  $('#activity-prs-total').textContent=totals.prsOpened+' opened / '+totals.prsClosed+' closed';
  $('#activity-pushes-total').textContent=totals.pushes.toLocaleString();
  const heat=$('#activity-heat'); heat.replaceChildren();
  const max=Math.max(1,...days.map(d=>d.total));
  for(const d of days){const cell=node('span',undefined,'heat-'+(d.total?Math.max(1,Math.ceil(d.total/max*4)):0));cell.title=d.date+' UTC · '+d.total+' events';heat.append(cell);}
  heat.setAttribute('aria-label',days.map(d=>d.date+': '+d.total+' events').join('; '));
  bars($('#activity-issues'),days,['issuesOpened','issuesClosed'],'Issue events: opened/closed');
  bars($('#activity-prs'),days,['prsOpened','prsClosed'],'Pull request events: opened/closed');
  bars($('#activity-pushes'),days,['pushes'],'Push events');
  const contributors=$('#activity-contributors');contributors.replaceChildren();
  if(!data.contributors) contributors.append(node('p','Contributor totals temporarily unavailable.','muted'));
  else {
    for(const person of data.contributors.slice(0,5)){
      if(!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(person.login)||!Number.isFinite(person.contributions))continue;
      const row=node('div',undefined,'contributor-row');const a=node('a',person.login);a.href='https://github.com/'+encodeURIComponent(person.login);a.target='_blank';a.rel='noopener noreferrer';row.append(a,node('span',person.contributions.toLocaleString()+' commits'));contributors.append(row);
    }
    if(!data.contributors.length)contributors.append(node('p','No public contributor totals available.','muted'));
  }
  $('#activity-status').textContent='Updated '+new Date(data.fetchedAt).toLocaleString()+'. GitHub may delay events. Timeline: up to 300 events / 30 days; displayed totals may be incomplete. Generated profile/catalog pushes excluded. Contributor counts are all-time across owned public non-fork projects, excluding the profile.';
}
async function api(path) {
  const response=await fetch('https://api.github.com'+path,{credentials:'omit',signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('GitHub temporarily unavailable');
  if(response.status===204)return [];
  const data=await response.json();if(!Array.isArray(data))throw Error('Unexpected GitHub response');return data;
}
async function load() {
  let fallback=null;
  try{const saved=JSON.parse(localStorage.getItem(cacheKey));if(saved?.events&&Number.isFinite(saved.fetchedAt)&&Date.now()-saved.fetchedAt<86400000){fallback=saved;render(saved,'cached GitHub data');if(Date.now()-saved.fetchedAt<900000)return;}}catch{}
  if(!fallback)try{const response=await fetch('activity.json');if(response.ok){fallback=await response.json();render(fallback,'saved GitHub snapshot');}}catch{}
  try{
    const events=[];for(let page=1;page<=3;page++){const rows=await api('/users/'+owner+'/events/public?per_page=100&page='+page);events.push(...rows);if(rows.length<100)break;}
    const repos=[];for(let page=1;page<=10;page++){const rows=await api('/users/'+owner+'/repos?type=owner&per_page=100&page='+page);repos.push(...rows.filter(r=>!r.private&&r.owner?.login?.toLowerCase()===owner));if(rows.length<100)break;}
    let contributors=null;
    try{
      const totals=new Map();
      const projects=repos.filter(r=>!r.fork&&r.name.toLowerCase()!==owner);
      // Bounded batches avoid flooding GitHub. Stop on errors; never present partial contributor totals as complete.
      for(let i=0;i<projects.length;i+=3){
        const results=await Promise.all(projects.slice(i,i+3).map(async r=>{
          const all=[];for(let page=1;page<=10;page++){const rows=await api('/repos/'+owner+'/'+encodeURIComponent(r.name)+'/contributors?per_page=100&page='+page);all.push(...rows);if(rows.length<100)return all;}throw Error('Contributor pagination truncated');
        }));
        for(const rows of results)for(const p of rows)if(p.login&&Number.isFinite(p.contributions))totals.set(p.login,(totals.get(p.login)||0)+p.contributions);
      }
      contributors=[...totals].map(([login,contributions])=>({login,contributions})).sort((a,b)=>b.contributions-a.contributions);
    }catch{}
    const data={events,repositories:repos.length,contributors,fetchedAt:Date.now()};render(data,'live GitHub data');try{localStorage.setItem(cacheKey,JSON.stringify(data));}catch{}
  }catch{if(fallback)$('#activity-status').append(' Live refresh unavailable; showing the dated snapshot.');else $('#activity-status').textContent='GitHub activity is temporarily unavailable. Open my GitHub profile to see the latest activity.';}
}
load();
