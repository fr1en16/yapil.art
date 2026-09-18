import fs from 'node:fs/promises';
import {createHash,createHmac} from 'node:crypto';
process.loadEnvFile('.env');
const dir='tmp/qude-source';
const hash=b=>createHash('sha256').update(b).digest('hex');
const hmac=(k,v)=>createHmac('sha256',k).update(v).digest();
const manifest=JSON.parse(await fs.readFile(`${dir}/media.json`,'utf8').catch(()=> '{}'));
const base=process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/,'');
if(base!=='https://media.yapil.art')throw Error('Incorrect public media host');
async function publish(id,buffer,type,ext){
 const digest=hash(buffer),key=`references/qude/${digest.slice(0,20)}.${ext}`;
 const host=`${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,uri=`/${process.env.R2_BUCKET}/${key}`;
 const date=new Date().toISOString().replace(/[:-]|\.\d{3}/g,'');
 const headers={host,'x-amz-date':date,'x-amz-content-sha256':digest,'content-type':type,'cache-control':'public, max-age=31536000, immutable'};
 const keys=Object.keys(headers).sort(),signed=keys.join(';'),canonical=['PUT',uri,'',keys.map(k=>`${k}:${headers[k]}\n`).join(''),signed,digest].join('\n');
 const scope=`${date.slice(0,8)}/auto/s3/aws4_request`;let signing=hmac(`AWS4${process.env.R2_SECRET_ACCESS_KEY}`,date.slice(0,8));for(const p of ['auto','s3','aws4_request'])signing=hmac(signing,p);
 const signature=createHmac('sha256',signing).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).digest('hex');
 headers.Authorization=`AWS4-HMAC-SHA256 Credential=${process.env.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signed}, Signature=${signature}`;
 const res=await fetch(`https://${host}${uri}`,{method:'PUT',headers,body:buffer});if(!res.ok)throw Error(`R2 HTTP ${res.status}`);
 const url=`${base}/${key}`,check=await fetch(url);if(!check.ok||check.headers.get('content-type')?.split(';')[0]!==type||hash(Buffer.from(await check.arrayBuffer()))!==digest)throw Error(`Verification failed ${id}`);
 manifest[id]={url,sha256:digest,bytes:buffer.length,type};await fs.writeFile(`${dir}/media.json`,JSON.stringify(manifest,null,2));console.log(`Verified ${id.split('/').pop()} (${buffer.length} bytes)`);
}
const urls=JSON.parse(await fs.readFile(`${dir}/asset-list.json`,'utf8'));
for(const url of urls){
 if(manifest[url])continue;
 const response=await fetch(url);if(!response.ok)throw Error(`Source HTTP ${response.status}: ${url}`);
 let buf=Buffer.from(await response.arrayBuffer()),ext=new URL(url).pathname.split('.').pop();
 let type=({svg:'image/svg+xml',mp3:'audio/mpeg',mp4:'video/mp4',woff:'font/woff',woff2:'font/woff2'})[ext];
 if(['jpg','jpeg','png','webp'].includes(ext)){
 const authorization=`Basic ${Buffer.from(`api:${process.env.TINIFY_API_KEY}`).toString('base64')}`;
 const shrink=await fetch('https://api.tinify.com/shrink',{method:'POST',headers:{Authorization:authorization},body:buf});if(!shrink.ok)throw Error(`Tinify shrink HTTP ${shrink.status}`);
 const converted=await fetch(shrink.headers.get('location'),{method:'POST',headers:{Authorization:authorization,'Content-Type':'application/json'},body:JSON.stringify({convert:{type:'image/webp'}})});if(!converted.ok)throw Error(`Tinify convert HTTP ${converted.status}`);
 buf=Buffer.from(await converted.arrayBuffer());if(buf.toString('ascii',0,4)!=='RIFF'||buf.toString('ascii',8,12)!=='WEBP')throw Error('Invalid WebP');ext='webp';type='image/webp';
 }
 if(!type)throw Error('Unsupported media type '+ext);
 await fs.writeFile(`${dir}/${hash(buf).slice(0,20)}.${ext}`,buf);await publish(url,buf,type,ext);
}
for(const name of (await fs.readdir(dir)).filter(n=>/^svg-\d+\.svg$/.test(n))){if(!manifest[name])await publish(name,await fs.readFile(`${dir}/${name}`),'image/svg+xml','svg');}
