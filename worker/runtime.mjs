const security = {"Content-Security-Policy": "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; script-src-attr 'none'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://cdn.myanimelist.net https://s4.anilist.co; connect-src 'self' https://cloudflareinsights.com https://api.github.com https://api.jikan.moe https://graphql.anilist.co https://api.lanyard.rest; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; upgrade-insecure-requests; frame-ancestors 'none'", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "X-Frame-Options": "DENY", "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()", "X-Robots-Tag": "noindex, nofollow, noarchive", "Strict-Transport-Security": "max-age=15552000"};
export default { async fetch(request) {
 const url = new URL(request.url);
 let path; try { path=decodeURIComponent(url.pathname); } catch { return new Response('Bad request',{status:400,headers:security}); }
 if(path==='/' || path==='/index.html') path='/index.html';
 const asset=assets[path]; const headers=new Headers(security);
 if(!['GET','HEAD'].includes(request.method)) { headers.set('Allow','GET, HEAD'); return new Response(null,{status:405,headers}); }
 if(!asset) { headers.set('Content-Type','text/plain; charset=utf-8');return new Response('Not found',{status:404,headers}); }
 headers.set('Content-Type',asset.type); headers.set('Cache-Control',path==='/index.html'?'no-cache':'public, max-age=3600');
 const bytes=Uint8Array.from(atob(asset.body),c=>c.charCodeAt(0));
 return new Response(request.method==='HEAD'?null:bytes,{status:200,headers});
}};
