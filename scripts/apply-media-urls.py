"""Apply only verified R2 URLs; retain local media as recoverable sources."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import posixpath
import re

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'media-manifest.json').read_text())['assets']
urls = {source: entry['url'] for source, entry in manifest.items() if entry.get('verifiedAt')}


def resolve(value, file):
    if value in urls:
        return urls[value]
    parsed = urlsplit(value)
    if parsed.scheme or value.startswith(('data:', '#')):
        if parsed.netloc == 'yapil.art':
            return urls.get(unquote(parsed.path), value)
        return value
    key = unquote(parsed.path)
    if not key.startswith('/') and file.is_relative_to(ROOT / 'public'):
        key = '/' + posixpath.normpath(str(file.parent.relative_to(ROOT / 'public')) + '/' + key)
    return urls.get(key, value)


# Remote originals must be migrated independently: local Tilda files may be tiny placeholders.
aliases = {}

extensions = r'(?:png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|mov|mp3|wav|ogg|woff2?|ttf|otf|eot|pdf)'
token = re.compile(r'(?<=["\x27`(\s])(?:https?://|\.\.?/|/|images/|fonts/)[^\s"\x27`<>]*?\.' + extensions + r'(?:\?[^\s"\x27`<>)]*)?(?=[\s"\x27`<>)]|$)', re.I)
files = []
for folder in ['src', 'content-drafts/seo', 'public/archive']:
    files.extend(p for p in (ROOT / folder).rglob('*') if p.suffix in ['.astro', '.ts', '.tsx', '.js', '.mjs', '.css', '.json', '.md', '.html'])
files.append(ROOT / 'public/site.webmanifest')
changed = []
for file in files:
    if file.name in ['media-urls.json', 'video-posters.json']:
        continue
    before = file.read_text()
    after = before
    if file.suffix == '.astro':
        def migrate_import(match):
            name, relative = match.groups()
            asset = (file.parent / relative).resolve()
            if not asset.is_relative_to(ROOT / 'src/assets'):
                return match[0]
            key = '/assets/' + str(asset.relative_to(ROOT / 'src/assets'))
            return f'const {name} = {{ src: {json.dumps(urls[key])} }};' if key in urls else match[0]
        after = re.sub(r'import (\w+) from ["\x27]([^"\x27]+\.(?:jpg|png|webp))["\x27];', migrate_import, after)
    after = token.sub(lambda m: aliases.get(m[0], resolve(m[0], file)), after)
    # Correct declared MIME types after PNG icons have become WebP.
    after = re.sub(r'<link\b[^>]*>', lambda m: m[0].replace('type="image/png"', 'type="image/webp"') if re.search(r'href="https://media\.yapil\.art/[^" ]+\.webp"', m[0]) else m[0], after)
    if file.name == 'site.webmanifest':
        data = json.loads(after)
        for icon in data['icons']:
            if icon['src'].endswith('.webp'):
                icon['type'] = 'image/webp'
        after = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if after != before:
        file.write_text(after)
        changed.append(str(file.relative_to(ROOT)))

(ROOT / 'src/data/media-urls.json').write_text(json.dumps(urls, ensure_ascii=False, indent=2) + '\n')
posters = {}
for source, url in urls.items():
    if source.endswith(('.mp4', '.webm')):
        poster = re.sub(r'\.(mp4|webm)$', '.webp', source)
        if poster in urls:
            posters[url] = urls[poster]
(ROOT / 'src/data/video-posters.json').write_text(json.dumps(posters, ensure_ascii=False, indent=2) + '\n')

# Fontsource's CSS remains identical except for its asset locations.
font_css = (ROOT / 'node_modules/@fontsource-variable/inter-tight/index.css').read_text()
font_css = re.sub(r'url\(([^)]+)\)', lambda m: 'url(' + urls.get('/fonts/' + Path(m[1]).name, m[1]) + ')', font_css)
if './files/' not in font_css:
    (ROOT / 'src/styles/inter-tight.css').write_text(font_css)
    for file in [ROOT / 'src/layouts/Base.astro', ROOT / 'src/pages/crm.astro', ROOT / 'src/pages/process-work.astro']:
        source = file.read_text().replace("import '@fontsource-variable/inter-tight';", "import '../styles/inter-tight.css';")
        file.write_text(source)

print(f'Applied {len(urls)} verified media mappings; changed {len(changed)} files.')
