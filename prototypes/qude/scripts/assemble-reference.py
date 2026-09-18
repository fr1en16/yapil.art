"""Assemble captured Qude frontend; all media resolve to verified Yapil R2 URLs."""
from pathlib import Path
import re,json,html
root=Path(__file__).resolve().parents[1]; source=root.parents[1]/'tmp/qude-source'; public=root/'public'; public.mkdir(exist_ok=True)
original=(source/'index.html').read_text(); manifest=json.loads((source/'media.json').read_text());svgs=re.findall(r'<svg\b[\s\S]*?</svg>',original)
svgs.extend((source/f'svg-{i}.svg').read_text() for i in range(len(svgs),42))
assets={k:v['url'] for k,v in manifest.items()}; svgmap={f'svg-{i}.svg':assets[f'svg-{i}.svg'] for i in range(len(svgs))}
scripts=re.findall(r'<script[^>]+src="([^"]+)"[^>]*></script>',original)
media={k:v for k,v in assets.items() if k.startswith('https:')}
# Only explicitly captured resources can be resolved; source CDN fallbacks are forbidden.
config={'media':media,'svgs':svgmap,'scripts':scripts}
(public/'reference-config.json').write_text(json.dumps(config,ensure_ascii=False))

def patch_svg_calls(s):
 matches=list(re.finditer(r'\(0,\w+\.jsxs?\)\("svg",\{',s)); count=0
 for m in reversed(matches):
  start=m.end()-1; depth=0;quote=None;esc=False;end=None
  for j in range(start,len(s)):
   ch=s[j]
   if quote:
    if esc:esc=False
    elif ch=='\\':esc=True
    elif ch==quote:quote=None
   elif ch in '\"\'`':quote=ch
   elif ch=='{':depth+=1
   elif ch=='}':
    depth-=1
    if depth==0:end=j+1;break
  props=s[start:end];d=re.search(r'\bd:"([^"]+)"',props);cls=re.search(r'\bclassName:"([^"]+)"',props);vb=re.search(r'\bviewBox:"([^"]+)"',props)
  candidates=[i for i,svg in enumerate(svgs) if (not vb or f'viewBox="{vb[1]}"' in svg) and (not d or f'd="{d[1]}"' in svg)]
  exact=[i for i in candidates if cls and f'class="{cls[1]}"' in svgs[i]]
  if exact:candidates=exact
  if not candidates:
   (source/'extra-svg-props.json').write_text(json.dumps(props));raise RuntimeError('Extra SVG source saved')
  s=s[:start]+f'window.qudeSvg({props},"svg-{candidates[0]}.svg")'+s[end:];count+=1
 return s,count

for url in scripts:
 src=source/url.split('/')[-1];dest=public/url.lstrip('/');dest.parent.mkdir(parents=True,exist_ok=True);s=src.read_text()
 if 'index-ccc' in url:
  s=s.replace('"https://cdn.sanity.io/files/u6q95fqm/production/".concat(r,".").concat(o)','window.qudeMedia("https://cdn.sanity.io/files/u6q95fqm/production/".concat(r,".").concat(o))')
  s=s.replace('(a=e.logo,S()(h).image(a)).width(300).url()','window.qudeImage(e.logo,300)')
  s=s.replace('(t=e.image,S()(h).image(t)).width(500).url()','window.qudeImage(e.image,500)')
  s=s.replace('fetch("https://www.p-a-m.cool/forms/",{body:new FormData(document.querySelector("#contactForm")),method:"POST"})','window.qudeDemoSubmit()')
  s=s.replace('Votre message a bien été envoyé','Démonstration : message non envoyé')
  s=s.replace('href:"/cookies"','href:"https://qude.audio/cookies",target:"_blank",rel:"noopener noreferrer"')
  s=s.replace('returnwindow.', 'return window.')
  s,n=patch_svg_calls(s);print('R2-backed SVG components:',n)
 if '_app-' in url:s=s.replace('l().initialize({gtmId:"GTM-KBNR3CJ"})','void 0')
 dest.write_text(s)
css=(source/'source.css').read_text()
for old,new in media.items():
 if old.startswith('https://qude.audio'):css=css.replace(old.removeprefix('https://qude.audio'),new)
cssdest=public/'_next/static/css/3e9378cb24c31db4.css';cssdest.parent.mkdir(parents=True,exist_ok=True);cssdest.write_text(css)
h=original
for old,new in sorted(media.items(),key=lambda kv:-len(kv[0])):h=h.replace(old,new)
# SVG geometry is fetched from R2 before hydration, preserving the animated source DOM.
i=iter(range(len(svgs)))
def svg_placeholder(m):
 n=next(i);tag=m[0][:m[0].index('>')];return tag+f' data-qude-asset="svg-{n}.svg"></svg>'
h=re.sub(r'<svg\b[\s\S]*?</svg>',svg_placeholder,h)
h=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',h)
h=h.replace('href="/cookies"','href="https://qude.audio/cookies" target="_blank" rel="noopener noreferrer"')
h=h.replace('<link rel="icon" href="/favicon.ico"/>',f'<link rel="icon" href="{assets["svg-0.svg"]}"/>')
h=h.replace('<link rel="canonical" href="https://qude.audio"/>','<meta name="robots" content="noindex,nofollow"/>')
h=re.sub(r'<meta property="og:image"[^>]*>','',h)
h=h.replace('</body>','<script src="/reference-loader.js"></script></body>')
(public/'qude.html').write_text(h)
(root/'media-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Assembled captured frontend:',len(scripts),'scripts;',len(manifest),'verified media mappings')
