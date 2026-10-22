import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.txt':'text/plain'};
const assets={};
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else if(entry.name!=='_headers'){const key='/'+relative('dist',path).replaceAll('\\','/');const extension=entry.name.slice(entry.name.lastIndexOf('.'));assets[key]={body:(await readFile(path)).toString('base64'),type:types[extension]??'application/octet-stream'};}}}
await walk('dist');await mkdir('build',{recursive:true});await writeFile('build/worker.mjs','const assets = '+JSON.stringify(assets)+';\n'+await readFile('worker/runtime.mjs','utf8'));console.log('Built secure Worker with '+Object.keys(assets).length+' static assets');
