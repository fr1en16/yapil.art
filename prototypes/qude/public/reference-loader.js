/* Load the captured frontend with media owned by the local prototype. */
(async () => {
  const response = await fetch('/reference-config.json');
  if (!response.ok) throw new Error('Could not load the reference manifest');
  const config = await response.json();
  const svgContent = {};
  const requests = new Map();
  for (const [id, url] of Object.entries(config.svgs)) {
    if (!requests.has(url)) requests.set(url, fetch(url).then(async response => {
      if (!response.ok) throw new Error(`Could not load SVG: ${response.status}`);
      const xml = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      return xml.documentElement.innerHTML;
    }));
    svgContent[id] = requests.get(url);
  }
  await Promise.all(Object.entries(svgContent).map(async ([id, request]) => { svgContent[id] = await request; }));
  window.qudeSvg = (props, id) => ({ ...props, children: undefined, dangerouslySetInnerHTML: { __html: svgContent[id] } });
  window.qudeMedia = url => {
    const result = config.media[url] || config.media[url.split('?')[0]];
    if (!result) throw new Error(`Unmapped reference media: ${url}`);
    return result;
  };
  window.qudeImage = (image, width) => {
    const [, digest, dimensions, extension] = image.asset._ref.split('-');
    const url = `https://cdn.sanity.io/images/u6q95fqm/production/${digest}-${dimensions}.${extension}`;
    return window.qudeMedia(`${url}?w=${width}`);
  };
  window.qudeDemoSubmit = () => Promise.resolve({ ok: true });
  document.querySelectorAll('[data-qude-asset]').forEach(svg => {
    svg.innerHTML = svgContent[svg.dataset.qudeAsset];
    svg.removeAttribute('data-qude-asset');
  });
  for (const url of config.scripts) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load reference script: ${url}`));
      document.body.appendChild(script);
    });
  }
})().catch(error => {
  console.error(error);
  const notice = document.createElement('p');
  notice.textContent = 'Impossible de charger les ressources. Veuillez actualiser la page.';
  notice.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;padding:20px;background:#fff;color:#141212;z-index:9999';
  document.body.appendChild(notice);
});
