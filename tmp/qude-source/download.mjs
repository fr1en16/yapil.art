import fs from 'node:fs/promises';
const h=await fs.readFile('tmp/qude-source/index.html','utf8');
const paths=[...h.matchAll(/src="(\/_next\/[^\"]+\.js)"/g)].map(m=>m[1]);
await Promise.all(paths.map(async p=>{const r=await fetch('https://qude.audio'+p);if(!r.ok)throw Error(r.status);await fs.writeFile('tmp/qude-source/'+p.split('/').pop(),await r.text());}));console.log('Saved',paths.length,'source script files');
