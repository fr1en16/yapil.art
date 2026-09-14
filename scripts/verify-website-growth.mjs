import { build } from 'esbuild';
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const bundle=await build({entryPoints:['src/data/websiteGrowth.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {websiteTopics,websiteCities,websitePages,newWebsitePages}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
assert.equal(websiteTopics.length,83);
assert.equal(websiteCities.length,15);
assert.equal(websitePages.length,1328);
assert.equal(newWebsitePages.length,1311);
assert.equal(new Set(websitePages.map(p=>p.path)).size,1328);
const root=resolve('dist/client');
const sitemap=readFileSync(resolve(root,'sitemap-0.xml'),'utf8');
const catalog=readFileSync(resolve(root,'websites/index.html'),'utf8');
const titles=new Set(),descriptions=new Set();
let checkedLinks=0;
for(const page of websitePages){
  const file=resolve(root,`.${page.path}/index.html`);
  assert.ok(existsSync(file),`Missing page: ${page.path}`);
  assert.ok(sitemap.includes(`<loc>https://yapil.art${page.path}</loc>`),`Missing sitemap URL: ${page.path}`);
  assert.ok(catalog.includes(`href="${page.path}"`),`Missing catalog link: ${page.path}`);
  const html=readFileSync(file,'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`H1: ${page.path}`);
  assert.ok(html.includes(`href="https://yapil.art${page.path}"`),`Canonical: ${page.path}`);
  assert.ok(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html),`Noindex: ${page.path}`);
  if(!page.path.startsWith('/websites/'))continue;
  const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
  const desc=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title&&!titles.has(title),`Duplicate/missing title: ${page.path}`);titles.add(title);
  assert.ok(desc&&!descriptions.has(desc),`Duplicate/missing description: ${page.path}`);descriptions.add(desc);
  assert.ok(html.includes('data-website-context='),`Missing lead context: ${page.path}`);
  assert.ok(html.includes(`город: ${page.city?.name??'Казахстан'}`),`Wrong city: ${page.path}`);
  for(const json of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs))JSON.parse(json[1]);
  for(const [,href] of html.matchAll(/href="(\/(?!\/)[^"#?]*)[^"]*"/g)){
    if(!href)continue;
    assert.ok(existsSync(resolve(root,`.${href}/index.html`))||existsSync(resolve(root,`.${href}`)),`Broken link ${page.path} → ${href}`);checkedLinks++;
  }
}
console.log(JSON.stringify({topics:websiteTopics.length,cities:websiteCities.length,total:websitePages.length,newPages:newWebsitePages.length,catalog:1,checkedLinks,status:'PASS'},null,2));
