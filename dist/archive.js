const $=id=>document.getElementById(id);
const paths={book:'M4 5h7l1 2 1-2h7v15h-7l-1 2-1-2H4z M12 7v15',code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 20',screen:'M2 4h20v14H2z M8 22h8m-4-4v4',link:'m9 15 6-6 M8 17l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 6 0m0 6a4 4 0 0 0 6 0l5-5a4 4 0 0 0-5-5l-2 2',star:'m12 1 3 7 8 1-6 5 2 9-7-5-7 5 2-9-6-5 8-1z',terminal:'m4 6 6 6-6 6m9 0h8',person:'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M3 22v-3a9 9 0 0 1 18 0v3',grid:'M2 2h8v8H2zm12 0h8v8h-8zM2 14h8v8H2zm12 0h8v8h-8z',chart:'M2 2v20h21M6 17v-5m6 5V5m6 12V9'};
const node=(title,subtitle,href,icon='book')=>({title,subtitle,href,icon});
const levels=[
 ['THE STORIES',[node('Novels','ONE MORE CHAPTER','#novels'),node('Anime','ONE MORE EPISODE','#anime','screen'),node('Manga','BETWEEN THE PANELS','#manga'),node('MyAnimeList','THE WATCHLIST','https://myanimelist.net/profile/chu_n_ma','star'),node('AniList','MY LIBRARY','https://anilist.co/user/chunma/','grid'),node('About','GREAT LOVE IMMORTAL','#about','person')]],
 ['THE WORKSHOP',[node('Projects','THINGS I BUILD','#projects','code'),node('ChunCord','MY DISCORD CORNER','https://github.com/chunma-san/ChunCord','screen'),node('Toolbox','USEFUL LITTLE THINGS','https://chunma-san.github.io/awesome-toolbox/','grid'),node('Repositories','OPEN THE SOURCE','https://github.com/chunma-san?tab=repositories','code'),node('Terminal','TYPE YOUR WAY IN','#terminal','terminal'),node('GitHub','PUBLIC WORK','https://github.com/chunma-san','link')]],
 ['THE SIGNAL',[node('Activity','CODE LEAVES A TRACE','#github-activity','chart'),node('Connections','ELSEWHERE ONLINE','#connections','link'),node('Discord','FIND ME HERE','https://discord.com/users/891081797318897715','screen'),node('GitHub','FOLLOW THE COMMITS','https://github.com/chunma-san','code'),node('About','BEHIND THE ARCHIVE','#about','person'),node('Index','EVERYTHING IN ONE PLACE','#index','grid')]]
];
let level=0,selected=0,phase=0,pointerX=0,pause=false,lastWheel=0,dragY=null,lastFocus=null;
try{pause=localStorage.getItem('chunma.archive.pause')==='true';}catch{}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const svg=icon=>`<svg viewBox="-2 -2 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="${paths[icon]||paths.book}"/></svg>`;
function caption(i){selected=i;const n=levels[level][1][i];$('map-title').textContent=n.title;$('map-subtitle').textContent=n.subtitle;}
function render(){
 $('node-map').replaceChildren();
 levels[level][1].forEach((n,i)=>{const a=document.createElement('a');a.className='map-node';a.href=n.href;a.innerHTML=`<span class="node-disc">${svg(n.icon)}</span><span class="node-label"></span>`;a.querySelector('.node-label').textContent=n.title;if(!n.href.startsWith('#')){a.target='_blank';a.rel='noopener';}a.addEventListener('pointerenter',()=>caption(i));a.addEventListener('focus',()=>caption(i));a.addEventListener('click',()=>lastFocus=a);$('node-map').append(a);});
 $('current-level').textContent=`LEVEL ${String(level+1).padStart(2,'0')} · ${levels[level][0]}`;
 $('level-number').textContent=`${String(level+1).padStart(2,'0')} / ${String(levels.length).padStart(2,'0')}`;caption(0);position();
}
function changeLevel(delta){level=(level+delta+levels.length)%levels.length;render();}
function position(){const w=innerWidth,h=innerHeight,small=w<580;[...$('node-map').children].forEach((a,i)=>{const row=Math.floor(i/2),side=i%2?1:-1;const x=side*w*(small?.30:.29)+Math.sin(phase+i)*6+pointerX*7;const y=(row-1)*h*(small?.17:.19)+h*.025;const scale=small?.82:1;a.style.transform=`translate(-50%,-50%) translate(${x}px,${y}px) scale(${scale}) rotate(${Math.sin(phase+i)*2}deg)`;});}
const allNodes=[...new Map(levels.flatMap(l=>l[1]).map(n=>[n.href,n])).values()];
function index(query=''){const q=query.trim().toLowerCase();$('index-results').replaceChildren();let count=0;allNodes.filter(n=>(n.title+' '+n.subtitle).toLowerCase().includes(q)).forEach(n=>{const a=document.createElement('a');a.className='index-entry';a.href=n.href;if(!n.href.startsWith('#')){a.target='_blank';a.rel='noopener';}a.innerHTML=`<span class="index-icon">${svg(n.icon)}</span><span><strong></strong><small></small></span><span aria-hidden="true">↗</span>`;a.querySelector('strong').textContent=n.title;a.querySelector('small').textContent=n.subtitle;$('index-results').append(a);count++;});$('index-empty').hidden=!!count;}
const sections=['about','connections','terminal','library','projects','github-activity'];
function route(){let hash=decodeURIComponent(location.hash.slice(1)||'home');if(hash==='home'){document.body.classList.remove('page-open');$('archive-page').hidden=true;if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});return;}
 const tabs={novels:'novel',anime:'anime',manga:'manga'};const target=tabs[hash]?'library':hash;const valid=target==='index'||sections.includes(target);if(!valid)return;
 sections.forEach(id=>{if($(id))$(id).hidden=id!==target;});$('archive-index').hidden=target!=='index';$('archive-content').hidden=target==='index';$('archive-page').hidden=false;document.body.classList.add('page-open');$('archive-page').scrollTop=0;
 if(tabs[hash])document.querySelector(`[data-tab="${tabs[hash]}"]`)?.click();
 if(target==='index'){index($('archive-search').value);$('archive-search').focus({preventScroll:true});}else $('archive-page').focus({preventScroll:true});
}
$('archive-search').addEventListener('input',e=>index(e.target.value));
$('previous-level').addEventListener('click',()=>changeLevel(-1));$('next-level').addEventListener('click',()=>changeLevel(1));
$('hide-guide').addEventListener('click',()=>$('map-guide').hidden=true);
function motion(){const stopped=pause||reduced.matches;$('motion-toggle').textContent=stopped?'Resume motion':'Pause motion';$('motion-toggle').setAttribute('aria-pressed',String(stopped));}
$('motion-toggle').addEventListener('click',()=>{pause=!pause;try{localStorage.setItem('chunma.archive.pause',String(pause));}catch{}motion();});reduced.addEventListener('change',motion);
$('archive-scene').addEventListener('wheel',e=>{if(document.body.classList.contains('page-open'))return;e.preventDefault();if(Date.now()-lastWheel>450&&Math.abs(e.deltaY)>12){lastWheel=Date.now();changeLevel(e.deltaY>0?1:-1);}},{passive:false});
$('archive-scene').addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;dragY=e.clientY;});
addEventListener('pointerup',e=>{if(dragY!==null&&Math.abs(e.clientY-dragY)>60)changeLevel(e.clientY<dragY?1:-1);dragY=null;});
addEventListener('pointermove',e=>pointerX=e.clientX/innerWidth-.5);
addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,[contenteditable]')||document.querySelector('dialog[open]'))return;if(e.key==='Escape'){location.hash='home';return;}if(e.key==='/'){e.preventDefault();location.hash='index';return;}if(document.body.classList.contains('page-open'))return;if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();changeLevel(e.key==='ArrowUp'?-1:1);}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selected=(selected+(e.key==='ArrowRight'?1:5))%6;$('node-map').children[selected].focus();}if(e.key==='Enter'&&!e.target.closest('a,button'))$('node-map').children[selected].click();});
const canvas=$('wires'),ctx=canvas.getContext('2d');let cw,ch,last=0;
function resize(){cw=innerWidth;ch=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=cw*d;canvas.height=ch*d;ctx.setTransform(d,0,0,d,0,0);position();}
function draw(time){requestAnimationFrame(draw);if(document.hidden||time-last<33)return;last=time;if(!pause&&!reduced.matches)phase+=.004;position();ctx.clearRect(0,0,cw,ch);ctx.lineWidth=1;for(let k=0;k<8;k++){ctx.strokeStyle=k%3===0?'#4c8a8a':'#535678';ctx.beginPath();for(let x=0;x<=cw;x+=8){const y=ch*(.25+(k%4)*.17)+Math.sin(x/cw*6+phase+k)*ch*.09+Math.cos(x/cw*13+k)*8;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}}
addEventListener('resize',resize);addEventListener('hashchange',route);render();motion();resize();route();requestAnimationFrame(draw);
