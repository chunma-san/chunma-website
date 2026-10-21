// Structural validation only: adult ratings and genres are not filtered.
export function safeMedia(media, type) {
  return !!media && Number.isInteger(media.mal_id) && media.mal_id > 0 && typeof media.title === 'string' && !!media.title.trim();
}
export function safeURL(url) { try { const u = new URL(url); const hosts = ['github.com', 'myanimelist.net', 'cdn.myanimelist.net','anilist.co','s4.anilist.co']; return u.protocol === 'https:' && hosts.includes(u.hostname) && !u.username && !u.password && (!u.port || u.port === '443') ? u.href : ''; } catch { return ''; } }
