/* Load frontend for Aktau food brand proposal */
(async () => {
  const response = await fetch('/aktau-config.json');
  if (!response.ok) throw new Error('Could not load aktau config');
  const config = await response.json();
  const svgContent = {};
  const requests = new Map();
  for (const [id, url] of Object.entries(config.svgs)) {
    if (!requests.has(url)) requests.set(url, fetch(url).then(async res => {
      if (!res.ok) throw new Error(`Could not load SVG: ${res.status}`);
      const xml = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
      return xml.documentElement.innerHTML;
    }));
    svgContent[id] = requests.get(url);
  }
  await Promise.all(Object.entries(svgContent).map(async ([id, req]) => { svgContent[id] = await req; }));
  window.qudeSvg = (props, id) => ({ ...props, children: undefined, dangerouslySetInnerHTML: { __html: svgContent[id] } });
  window.qudeMedia = url => {
    const result = config.media[url] || config.media[url.split('?')[0]];
    if (!result) throw new Error(`Unmapped media: ${url}`);
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
      script.onerror = () => reject(new Error(`Could not load script: ${url}`));
      document.body.appendChild(script);
    });
  }

  // Inject structured pricing and terms table into #Metiers after hydration
  function injectTables() {
    const metiersEl = document.querySelector('#Metiers');
    if (metiersEl && !document.querySelector('#aktauPricingTable')) {
      const wrapper = document.createElement('div');
      wrapper.id = 'aktauPricingTable';
      wrapper.className = 'mt-[60px] pt-[40px] border-t-[1px] border-noir/20';
      wrapper.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-[40px]">
          <div>
            <h4 class="text-[20px] font-medium tracking-tight mb-[20px] uppercase font-serif" style="font-family:'Oranienbaum',Georgia,serif">Этапы и сроки (6–7 недель)</h4>
            <div class="space-y-[15px] text-[14px] leading-relaxed">
              <div class="p-[18px] rounded-[8px] bg-noir/[0.04] border border-noir/10">
                <div class="flex justify-between font-semibold mb-[5px]">
                  <span style="font-family:'Oranienbaum',Georgia,serif;font-size:18px">1. Нейминг</span>
                  <span class="text-rouge font-mono">1 неделя</span>
                </div>
                <p class="opacity-70 text-[13px]">5–8 вариантов названия, патентная проверка в реестре ТМ РК, финальная рекомендация с обоснованием.</p>
              </div>
              <div class="p-[18px] rounded-[8px] bg-noir/[0.04] border border-noir/10">
                <div class="flex justify-between font-semibold mb-[5px]">
                  <span style="font-family:'Oranienbaum',Georgia,serif;font-size:18px">2. Визуальная система</span>
                  <span class="text-rouge font-mono">2 недели</span>
                </div>
                <p class="opacity-70 text-[13px]">Логотип (адаптации и знак), цвета, шрифтовая пара, стилеобразующая графика, брендбук в PDF.</p>
              </div>
              <div class="p-[18px] rounded-[8px] bg-noir/[0.04] border border-noir/10">
                <div class="flex justify-between font-semibold mb-[5px]">
                  <span style="font-family:'Oranienbaum',Georgia,serif;font-size:18px">3. Упаковка (4 категории)</span>
                  <span class="text-rouge font-mono">2 недели</span>
                </div>
                <p class="opacity-70 text-[13px]">Концепции под шоковую заморозку, макеты с линиями реза/биговки (AI/PDF), спецификация материалов.</p>
              </div>
              <div class="p-[18px] rounded-[8px] bg-noir/[0.04] border border-noir/10">
                <div class="flex justify-between font-semibold mb-[5px]">
                  <span style="font-family:'Oranienbaum',Georgia,serif;font-size:18px">4. Точка продаж</span>
                  <span class="text-rouge font-mono">3–5 дней</span>
                </div>
                <p class="opacity-70 text-[13px]">Макет фасадной вывески в векторе, гайдлайн оформления витрины торгового зала в Актау.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-[20px] font-medium tracking-tight mb-[20px] uppercase" style="font-family:'Oranienbaum',Georgia,serif">Смета и условия работы</h4>
            <div class="p-[24px] rounded-[10px] bg-noir text-blanc text-[14px]">
              <div class="space-y-[12px] pb-[20px] border-b border-blanc/20">
                <div class="flex justify-between">
                  <span class="opacity-80">1. Нейминг и проверка ТМ</span>
                  <span class="font-mono">150 000 ₸</span>
                </div>
                <div class="flex justify-between">
                  <span class="opacity-80">2. Визуальная система и упаковка</span>
                  <span class="font-mono">600 000 ₸</span>
                </div>
                <div class="flex justify-between">
                  <span class="opacity-80">3. Оформление точки продаж</span>
                  <span class="font-mono">100 000 ₸</span>
                </div>
              </div>
              <div class="flex justify-between items-baseline pt-[18px] text-[18px] font-medium">
                <span style="font-family:'Oranienbaum',Georgia,serif;font-size:20px">Итоговый бюджет</span>
                <span class="text-[22px] font-mono text-jaune">850 000 ₸</span>
              </div>
              <div class="mt-[20px] pt-[20px] border-t border-blanc/20 text-[12px] leading-relaxed opacity-80 space-y-[6px]">
                <p>• <strong>Оплата:</strong> 50% предоплата перед стартом, 50% после утверждения макетов.</p>
                <p>• <strong>Правки:</strong> 2 раунда правок на каждом этапе входят в стоимость.</p>
                <p>• <strong>Материалы:</strong> все векторные макеты и шрифты передаются клиенту.</p>
                <p>• <strong>Срок действия КП:</strong> 14 дней с даты отправки.</p>
              </div>
            </div>
          </div>
        </div>
      `;
      metiersEl.appendChild(wrapper);
    }
  }

  setInterval(injectTables, 500);
})().catch(err => {
  console.error(err);
});
