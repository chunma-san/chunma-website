// A browser-only command palette. No shell, eval, credentials or server access.
const form = document.querySelector('#terminal-form');
const input = document.querySelector('#terminal-input');
const output = document.querySelector('#terminal-output');
const history = [];
let cursor = 0;
const sections = { home: 'home', library: 'library', projects: 'projects', terminal: 'terminal', activity: 'github-activity' };
function line(text, type = '') {
  const p = document.createElement('p');
  p.textContent = text;
  p.className = type;
  output.append(p);
  while (output.children.length > 60) output.firstElementChild.remove();
  output.scrollTop = output.scrollHeight;
}
function go(section) {
  document.getElementById(section)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const raw = input.value.trim();
  if (!raw) return;
  history.push(raw); if (history.length > 50) history.shift(); cursor = history.length;
  input.value = '';
  const [command, ...args] = raw.toLowerCase().split(/\s+/);
  if (command === 'clear') { output.replaceChildren(); return; }
  line('visitor@chunma:~$ ' + raw, 'command-echo');
  if (command === 'help') {
    line('help              show this directory\nabout             a little about this place\nlibrary           open my reading & watching corner\nanime / manga     switch the library\nnovel / novels    show my novels\nprojects [query]  browse or search public projects\nactivity          show GitHub activity\nlinks             show my profile links\nstatus            current public Discord presence\nhome              back to the beginning\nclear             clear terminal history on screen');
  } else if (command === 'about' || command === 'whoami') {
    line('Chunma / Fang Yuan\nGreat Love Immortal Venerable.\nStories, code, self-hosted tools, and useful little experiments.\nEvery story leaves a trace. Every project starts with curiosity.');
  } else if (['anime', 'manga', 'novel', 'novels'].includes(command)) {
    document.querySelector('[data-tab="' + (command === 'novels' ? 'novel' : command) + '"]')?.click();
    line('Opening ' + command + ' library…'); go('library');
  } else if (command === 'projects') {
    const search = document.querySelector('#project-search');
    search.value = args.join(' '); search.dispatchEvent(new Event('input', { bubbles: true }));
    line(args.length ? 'Searching public projects: ' + args.join(' ') : 'Opening public project directory…'); go('projects');
  } else if (command === 'links') {
    line('GitHub       github.com/chunma-san\nDiscord      discord.com/users/891081797318897715\nMyAnimeList  myanimelist.net/profile/chu_n_ma\nAniList      anilist.co/user/chunma/\nClickable profile links are directly below this terminal.');
  } else if (command === 'status') {
    line('Discord: ' + document.querySelector('#discord-status').textContent + '\nPublic profile presence only; no private server information.');
  } else if (Object.hasOwn(sections, command)) {
    line('Opening /' + command + '…'); go(sections[command]);
  } else {
    line('Unknown command: ' + command + '\nType help for available commands.');
  }
});
input.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    cursor = Math.max(0, Math.min(history.length, cursor + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = history[cursor] || '';
  }
});
