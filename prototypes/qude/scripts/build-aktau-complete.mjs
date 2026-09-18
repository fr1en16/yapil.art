import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

// 1. Build index-aktau.js
const originalIndexJsPath = path.join(publicDir, "_next/static/chunks/pages/index-ccc070f5dc9af175.js");
let indexJs = fs.readFileSync(originalIndexJsPath, "utf8");

const replacementsJs = [
  // Navigation Menu
  ['children:"Rēfērences"', 'children:"Контекст"'],
  ['children:"Services"', 'children:"Услуги"'],
  ['children:"Ēquipe"', 'children:"Этапы и цены"'],
  ['children:"Prendre RDV"', 'children:"Обсудить проект"'],
  ['children:"Contact"', 'children:"Контакты"'],
  ['children:"Let\'s record"', 'children:"Задать вопрос"'],

  // Hero section
  ['children:"Agence"', 'children:"Брендинг"'],
  ['children:"Audio Crēative"', 'children:"& Упаковка"'],
  ['"Crēation, production & diffusion de podcasts. "', '"Комплексная разработка бренда. "'],
  ['children:"\\xc0 Toulouse. Et partout ailleurs."', 'children:"В Актау. С прицелом на сеть."'],
  ['children:"Avec votre clavier"', 'children:"С клавиатуры"'],
  ['"Scroll or "', '"Листайте "'],
  ['children:"play"', 'children:"вниз"'],

  // Quote & Intro
  ['children:"\\u201c Cr\\xe9er un podcast,\\nc\'est donner la parole \\u201d"', 'children:"\\u201c Качественная готовая еда\\nбез ощущения полуфабрикатов \\u201d"'],
  ['["Mathieu Vigui\\xe9 ",(0,o.jsx)("br",{}),"Fondateur de Qude"]', '["Yapil Studio ",(0,o.jsx)("br",{}),"Коммерческое предложение"]'],
  ['children:"Écouter le manifeste"', 'children:"Концепция проекта"'],
  ['children:"\\xc9couter le manifeste"', 'children:"Концепция проекта"'],
  ['r&&"Arr\\xeater la lecture"||"\\xc9couter le manifeste"', 'r&&"Остановить"||"Концепция проекта"'],

  // Question & Pillars
  ['children:"Nous contacter"', 'children:"Обсудить проект"'],
  ['children:"Ensemble, mettons votre projet"', 'children:"Создаём сильный бренд:"'],
  ['children:"En forme"', 'children:"В стратегии"'],
  ['children:"En son"', 'children:"В дизайне"'],
  ['children:"En ligne"', 'children:"В ритейле"'],

  // Ticker Competencies (fixedTags)
  ['children:"Conceptualisation"', 'children:"Нейминг"'],
  ['children:"R\\xe9daction"', 'children:"Патент ТМ РК"'],
  ['children:"Voix off"', 'children:"Позиционирование"'],
  ['children:"Identit\\xe9 sonore"', 'children:"Архитектура бренда"'],
  ['children:"Enregistrement"', 'children:"Логотип & Знак"'],
  ['children:"Montage"', 'children:"Брендбук-гайдлайн"'],
  ['children:"Sound Design"', 'children:"Дизайн упаковки"'],
  ['children:"Mixage"', 'children:"Препресс-макеты"'],
  ['children:"Diffusion"', 'children:"Оформление витрин"'],

  // Cards
  ['children:[e.episodes," Podcasts"]', 'children:[e.episodes,""]'],
  ['children:["Confidentiel ",(0,o.jsx)(H,{})]', 'children:["Первая точка ",(0,o.jsx)(H,{})]'],

  // Services
  ['children:"Nos services"', 'children:"Что входит в работу"'],

  // Metiers
  ['children:"Nos mētiers"', 'children:"Этапы, сроки и стоимость"'],
  ['children:"Nos m\\u0113tiers"', 'children:"Этапы, сроки и стоимость"'],
  ['children:"\\xc9couter"', 'children:"Детали"'],
  ['children:"Écouter"', 'children:"Детали"'],

  // Studio
  ['children:"Studio"', 'children:"Локация: Актау"'],
  ['children:["266, avenue de Lardenne",(0,o.jsx)("br",{}),"31100 Toulouse"]', 'children:["г. Актау, Казахстан",(0,o.jsx)("br",{}),"Мангистауская область"]'],
  ['" Voir sur google maps"', '" Посмотреть на карте"'],
  ['" Prendre rdv"', '" Обсудить проект"'],

  // Footer / Form
  ['children:l&&"Merci"||"Let\'s talk"', 'children:l&&"Спасибо"||"Обсудить проект"'],
  ['children:"Prise de contact, t\\xe9moignage ou simple bonjour..."', 'children:"Есть вопросы по этапам или составу работ ? "'],
  ['"Laissez nous un message audio"', '"Свяжитесь с нами удобным способом,"'],
  ['"et vos coordonn\\xe9es si vous souhaitez \\xeatre recontact\\xe9."', '"чтобы обсудить запуск бренда готовой еды в Актау."'],
  ['"Aucun enregistrement ne sera utilis\\xe9 sans votre consentement."', '"Данные конфиденциальны и используются только для связи."'],
  ['"Start Recording"', '"Начать запись"'],
  ['"Stop Recording"', '"Остановить запись"'],
  ['"Download Recording"', '"Скачать запись"'],
  ['[(0,o.jsx)(B,{})," D\\xe9marrer"]', '[(0,o.jsx)(B,{})," Запись"]'],
  ['[(0,o.jsx)(B,{})," Arr\\xeater"]', '[(0,o.jsx)(B,{})," Стоп"]'],
  ['[(0,o.jsx)(z,{})," Refaire"]', '[(0,o.jsx)(z,{})," Заново"]'],
  ['[(0,o.jsx)(I,{})," \\xc9couter"]', '[(0,o.jsx)(I,{})," Слушать"]'],
  ['[(0,o.jsx)(W,{})," T\\xe9l\\xe9charger"]', '[(0,o.jsx)(W,{})," Скачать"]'],
  ['[(0,o.jsx)(D,{})," Effacer"]', '[(0,o.jsx)(D,{})," Сбросить"]'],
  ['children:"Envoyer"', 'children:"Отправить"'],
  ['children:"Site by Pam"', 'children:"Yapil Studio"'],
  ['children:"Légal"', 'children:"Условия работы"'],
  ['children:"L\\xe9gal"', 'children:"Условия работы"'],
  ['["hello",(0,o.jsx)("span",{children:"@"}),"qude",(0,o.jsx)("span",{children:"."}),"audio"]', '["hello",(0,o.jsx)("span",{children:"@"}),"yapil",(0,o.jsx)("span",{children:"."}),"art"]']
];

for (const [target, repl] of replacementsJs) {
  if (indexJs.includes(target)) {
    indexJs = indexJs.replaceAll(target, repl);
  }
}

// Cards JSX Replacements:
// 1. Card header with title on left and price on right
const tCardHeader = `(0,o.jsx)("h3",{className:"h4 uppercase lg:col-span-2 lg:order-[-1] lg:pb-[20px] lg:border-b-[1px] lg:border-[#ddd]",children:e.name})`;
const rCardHeader = `(0,o.jsxs)("div",{className:"lg:col-span-2 lg:order-[-1] lg:pb-[20px] lg:border-b-[1px] lg:border-[#ddd] flex flex-wrap items-baseline justify-between gap-[10px]",children:[(0,o.jsx)("h3",{className:"h4 uppercase",children:e.name}),e.price&&(0,o.jsx)("span",{className:"text-[18px] lg:text-[24px] font-mono font-medium text-rouge tracking-tight",children:e.price})]})`;
indexJs = indexJs.replace(tCardHeader, rCardHeader);

// 2. Card number styling for 4th card (text-rouge)
const tCardNumber = `(0,o.jsx)("span",{className:"block group-[:nth-of-type(1)]:text-jaune group-[:nth-of-type(2)]:text-bleu group-[:nth-of-type(3)]:text-vert text-[30px] lg:text-[307px] tracking-[-0.02em] leading-[1] lg:leading-[0.75] self-center lg:self-end justify-self-end lg:justify-self-start",children:t+1})`;
const rCardNumber = `(0,o.jsx)("span",{className:"block group-[:nth-of-type(1)]:text-jaune group-[:nth-of-type(2)]:text-bleu group-[:nth-of-type(3)]:text-vert group-[:nth-of-type(4)]:text-rouge text-[30px] lg:text-[307px] tracking-[-0.02em] leading-[1] lg:leading-[0.75] self-center lg:self-end justify-self-end lg:justify-self-start",children:t+1})`;
indexJs = indexJs.replace(tCardNumber, rCardNumber);

// 3. Card transform for 4 cards (0, 40px, 80px, 120px)
const tCardTrans = `1==t&&"lg:translate-y-[40px]"||2==t&&"lg:translate-y-[80px]"`;
const rCardTrans = `1==t&&"lg:translate-y-[40px]"||2==t&&"lg:translate-y-[80px]"||3==t&&"lg:translate-y-[120px]"`;
indexJs = indexJs.replace(tCardTrans, rCardTrans);

// 4. Hide platform podcast icons
const tCardPlatforms = `!1!=e.platforms&&(0,o.jsxs)("div",{className:"grid grid-cols-2 gap-[10px] md:mt-[20px]"`;
const rCardPlatforms = `!1&&(0,o.jsxs)("div",{className:"grid grid-cols-2 gap-[10px] md:mt-[20px]"`;
indexJs = indexJs.replace(tCardPlatforms, rCardPlatforms);

// 5. GSAP scrollTrigger for 4 cards
const tCardGsap = `c.p8.to(".cardsOffre article:nth-of-type(1)",{scale:.8,rotateX:"-10deg",backgroundColor:"#737171",immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(1)",start:"top 15%",endTrigger:".cardsOffre article:nth-of-type(3)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(1) .trame",{opacity:.7,immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(1)",start:"top 15%",endTrigger:".cardsOffre article:nth-of-type(3)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(2)",{scale:.85,rotateX:"-10deg",backgroundColor:"#949393",immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(2)",start:"top 20%",endTrigger:".cardsOffre article:nth-of-type(3)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(2) .trame",{opacity:.7,immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(2)",start:"top 20%",endTrigger:".cardsOffre article:nth-of-type(3)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(3)",{scale:.9,rotateX:"-10deg",backgroundColor:"#949393",immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(3)",start:"top 20%",end:"+=800",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(3) .trame",{opacity:.7,immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(3)",start:"top 20%",end:"+=800",scrub:!0}})`;
const rCardGsap = `c.p8.to(".cardsOffre article:nth-of-type(1)",{scale:.78,rotateX:"-10deg",backgroundColor:"#737171",immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(1)",start:"top 15%",endTrigger:".cardsOffre article:nth-of-type(4)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(1) .trame",{opacity:.7,immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(1)",start:"top 15%",endTrigger:".cardsOffre article:nth-of-type(4)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(2)",{scale:.84,rotateX:"-10deg",backgroundColor:"#848383",immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(2)",start:"top 18%",endTrigger:".cardsOffre article:nth-of-type(4)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(2) .trame",{opacity:.7,immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(2)",start:"top 18%",endTrigger:".cardsOffre article:nth-of-type(4)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(3)",{scale:.9,rotateX:"-10deg",backgroundColor:"#949393",immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(3)",start:"top 20%",endTrigger:".cardsOffre article:nth-of-type(4)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(3) .trame",{opacity:.7,immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(3)",start:"top 20%",endTrigger:".cardsOffre article:nth-of-type(4)",end:"top 0%",scrub:!0}}),c.p8.to(".cardsOffre article:nth-of-type(4)",{immediateRender:!0,scrollTrigger:{trigger:".cardsOffre article:nth-of-type(4)",start:"top 20%",end:"+=800",scrub:!0}})`;
indexJs = indexJs.replace(tCardGsap, rCardGsap);

const aktauIndexJsPath = path.join(publicDir, "_next/static/chunks/pages/index-aktau.js");
fs.writeFileSync(aktauIndexJsPath, indexJs);
console.log("Written index-aktau.js with 4 cards and pricing");

// 2. Build aktau-config.json
const refConfig = JSON.parse(fs.readFileSync(path.join(publicDir, "reference-config.json"), "utf8"));
const aktauConfig = {
  ...refConfig,
  scripts: refConfig.scripts.map(s => s.includes("index-ccc") ? "/_next/static/chunks/pages/index-aktau.js" : s)
};
fs.writeFileSync(path.join(publicDir, "aktau-config.json"), JSON.stringify(aktauConfig, null, 2));
console.log("Written aktau-config.json");

// 3. Build aktau-loader.js
const aktauLoaderJs = `/* Load frontend for Aktau food brand proposal */
(async () => {
  const response = await fetch('/aktau-config.json');
  if (!response.ok) throw new Error('Could not load aktau config');
  const config = await response.json();
  const svgContent = {};
  const requests = new Map();
  for (const [id, url] of Object.entries(config.svgs)) {
    if (!requests.has(url)) requests.set(url, fetch(url).then(async res => {
      if (!res.ok) throw new Error(\`Could not load SVG: \${res.status}\`);
      const xml = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
      return xml.documentElement.innerHTML;
    }));
    svgContent[id] = requests.get(url);
  }
  await Promise.all(Object.entries(svgContent).map(async ([id, req]) => { svgContent[id] = await req; }));
  window.qudeSvg = (props, id) => ({ ...props, children: undefined, dangerouslySetInnerHTML: { __html: svgContent[id] } });
  window.qudeMedia = url => {
    const result = config.media[url] || config.media[url.split('?')[0]];
    if (!result) throw new Error(\`Unmapped media: \${url}\`);
    return result;
  };
  window.qudeImage = (image, width) => {
    const [, digest, dimensions, extension] = image.asset._ref.split('-');
    const url = \`https://cdn.sanity.io/images/u6q95fqm/production/\${digest}-\${dimensions}.\${extension}\`;
    return window.qudeMedia(\`\${url}?w=\${width}\`);
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
      script.onerror = () => reject(new Error(\`Could not load script: \${url}\`));
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
      wrapper.innerHTML = \`
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
      \`;
      metiersEl.appendChild(wrapper);
    }
  }

  setInterval(injectTables, 500);
})().catch(err => {
  console.error(err);
});
`;
fs.writeFileSync(path.join(publicDir, "aktau-loader.js"), aktauLoaderJs);
console.log("Written aktau-loader.js");

// 4. Build aktau.html
const qudeHtml = fs.readFileSync(path.join(publicDir, "qude.html"), "utf8");
const match = qudeHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
const nextData = JSON.parse(match[1]);
const props = nextData.props.pageProps;

function makeBlock(text, marks = []) {
  return {
    _key: "k_" + Math.random().toString(36).slice(2, 9),
    _type: "block",
    children: [
      {
        _key: "s_" + Math.random().toString(36).slice(2, 9),
        _type: "span",
        marks: marks,
        text: text
      }
    ],
    markDefs: [],
    style: "normal"
  };
}

// Intro
if (props.intro && props.intro[0]) {
  const intro = props.intro[0];
  intro.taglineIntro = [
    makeBlock("“ Качественная готовая еда,\nбез ощущения полуфабрикатов ”")
  ];
  intro.speechIntroA = [
    makeBlock("Клиент запускает новый продукт: собственное производство и розничная продажа готовой замороженной еды в Актау.\nФормат совмещает производство, фасовку, шоковую заморозку, хранение, торговый зал и выдачу доставки на одной точке."),
    makeBlock("После первого запуска планируется открытие дополнительных точек реализации с отдельным производственным цехом."),
    makeBlock("Линейка на старте: основные блюда, супы, гарниры, соусы. Целевая аудитория — семьи и работающие люди, которым важно держать дома запас качественной готовой еды без ощущения магазина полуфабрикатов.")
  ];
  intro.speechIntroB = [
    makeBlock("Рабочее название продукта не подходит для дальнейшего использования: слишком распространено и слабо защищается юридически.\nНужен новый бренд, который выдержит рост в сеть и годится не только для супов.")
  ];
  intro.file = [
    "Собственное производство в Актау ?",
    "Шоковая заморозка и витрина ?\nЛинейка супов и вторых блюд ?",
    "Устарело рабочее название ?",
    "Нужен сильный бренд для сети ?",
    "Вы обратились по адресу."
  ];
}

// References
if (props.references && props.references[0]) {
  const ref = props.references[0];
  ref.string = "Создаём сильный бренд:";
  ref.speech = [
    makeBlock("Формат совмещает собственное производство, фасовку, шоковую заморозку, хранение, торговый зал и выдачу доставки на одной точке в Актау.")
  ];
  ref.speechB = [
    makeBlock("Линейка на старте: основные блюда, супы, гарниры, соусы. Целевая аудитория — семьи и работающие люди, которым важно держать дома запас качественной готовой еды без ощущения магазина полуфабрикатов.")
  ];
}

// Podcasts (9 items)
const fallbackAudio = {
  _key: "f_fallback",
  _type: "file",
  asset: {
    _ref: "file-cd38d94c8ae268cee66807228199451f8964fc71-mp3",
    _type: "reference"
  }
};

const newPodcastsData = [
  { name: "Основные блюда", dates: "Лоток СВЧ/духовка", episodes: "Категория 01", reward: undefined, skills: ["conceptualisation", "montage", "mixage"], confidentiel: false },
  { name: "Супы", dates: "Миска + поясок", episodes: "Категория 02", reward: undefined, skills: ["redaction", "voix-off", "sound-design"], confidentiel: false },
  { name: "Гарниры", dates: "Формованный лоток", episodes: "Категория 03", reward: undefined, skills: ["enregistrement", "identite-sonore"], confidentiel: false },
  { name: "Фирменные соусы", dates: "Саше малого объема", episodes: "Категория 04", reward: undefined, skills: ["conceptualisation", "diffusion"], confidentiel: false },
  { name: "Шоковая заморозка", dates: "-35°C контакт", episodes: "Техпроцесс", reward: "❄️ Качество вкуса", skills: ["enregistrement", "montage"], confidentiel: false },
  { name: "Крафт-рукав и поясок", dates: "Премиум-подача", episodes: "Позиционирование", reward: "✨ Выше эконома", skills: ["redaction", "sound-design"], confidentiel: false },
  { name: "Точка продаж: Актау", dates: "Зал + цех + доставка", episodes: "Первая точка", reward: undefined, skills: ["diffusion", "identite-sonore"], confidentiel: false },
  { name: "Масштабирование в сеть", dates: "Готовность к росту", episodes: "Архитектура", reward: undefined, skills: ["conceptualisation", "redaction"], confidentiel: false },
  { name: "Сроки: 6–7 недель", dates: "4 этапа под ключ", episodes: "График запуска", reward: undefined, skills: ["conceptualisation", "montage", "diffusion"], confidentiel: false }
];

if (props.podcasts) {
  props.podcasts.forEach((p, i) => {
    if (newPodcastsData[i]) {
      p.name = newPodcastsData[i].name;
      p.dates = newPodcastsData[i].dates;
      p.episodes = newPodcastsData[i].episodes;
      p.reward = newPodcastsData[i].reward;
      p.skills = newPodcastsData[i].skills;
      p.confidentiel = newPodcastsData[i].confidentiel;
      if (!p.file || p.file.length === 0) {
        p.file = [fallbackAudio];
      }
    }
  });
}

// Offre (4 cards with individual stage pricing & total)
props.offre = [
  {
    _createdAt: "2023-03-12T10:54:17Z",
    _id: "offre-1-naming",
    _rev: "rev1",
    _type: "offre",
    _updatedAt: "2023-05-11T12:13:12Z",
    order: 1,
    name: "1. Нейминг и стратегия",
    price: "150 000 ₸",
    platforms: false,
    chapeau: [makeBlock("Разработка 5–8 вариантов названия\nс юридической проверкой в реестре ТМ РК (1 неделя)")],
    description: [
      makeBlock("• Разработка 5–8 вариантов названия под критерии клиента и специфику рынка готовой еды.\n• Экспресс-проверка на занятость и охраноспособность в государственном реестре товарных знаков РК.\n• Финальная рекомендация приоритетного названия с полным маркетинговым обоснованием."),
      makeBlock("• Формулировка позиционирования: домашнее качество + современный формат без ухода в дешёвые полуфабрикаты.\n• Архитектура бренда: масштабируемая система под основные блюда, супы, гарниры и соусы.\n• Тон коммуникации (Tone of Voice) для розницы, курьерской доставки и B2B.")
    ]
  },
  {
    _createdAt: "2023-03-12T10:54:09Z",
    _id: "offre-2-identity",
    _rev: "rev2",
    _type: "offre",
    _updatedAt: "2023-03-12T11:00:15Z",
    order: 2,
    name: "2. Визуальная система и упаковка",
    price: "600 000 ₸",
    platforms: false,
    chapeau: [makeBlock("Фирменный стиль, брендбук и готовые макеты\nдля 4 продуктовых категорий (2–3 недели)")],
    description: [
      makeBlock("• Айдентика бренда: логотип (горизонтальная и вертикальная версии, знак/монограмма), фирменные цвета (Pantone, CMYK, RGB), шрифтовая пара, стилеобразующая графика.\n• Брендбук-гайдлайн в PDF по правилам использования стиля для внутренней команды и типографий."),
      makeBlock("• Дизайн-концепции упаковки для 4 продуктовых линеек: основные блюда, супы, гарниры, соусы.\n• Техническая проработка под шоковую заморозку (-35°C), защиту от конденсата и эргономику розничной витрины.\n• Финальные векторные препресс-макеты (AI/PDF) с линиями реза и сгиба, полностью готовые к сдаче в печать.")
    ]
  },
  {
    _createdAt: "2023-03-12T10:53:58Z",
    _id: "offre-3-pos",
    _rev: "rev3",
    _type: "offre",
    _updatedAt: "2023-03-12T10:57:29Z",
    order: 3,
    name: "3. Точка продаж и внедрение",
    price: "100 000 ₸",
    platforms: false,
    chapeau: [makeBlock("Оформление первой точки в Актау\nи сопровождение запуска (3–5 дней)")],
    description: [
      makeBlock("• Базовые указания по оформлению торгового зала и входной группы на первой точке в г. Актау.\n• Векторный макет фасадной световой вывески для производства наружной рекламы."),
      makeBlock("• Гайдлайн по брендированию и оформлению розничной холодильной витрины готовой еды.\n• Авторский надзор: сопровождение цветопроб и консультации технологов типографии при запуске тиража.")
    ]
  },
  {
    _createdAt: "2023-03-12T10:55:00Z",
    _id: "offre-4-total",
    _rev: "rev4",
    _type: "offre",
    _updatedAt: "2023-03-12T11:05:00Z",
    order: 4,
    name: "4. Итоговый бюджет",
    price: "850 000 ₸",
    platforms: false,
    chapeau: [makeBlock("Комплексный запуск бренда «под ключ»\nза 6–7 недель с гарантией результата")],
    description: [
      makeBlock("• Полный комплекс работ: Нейминг и проверка ТМ + Визуальная система + Упаковка 4 категорий + Оформление точки продаж в Актау.\n• Сроки проекта: 6–7 недель от старта до готовых тиражных макетов для типографии."),
      makeBlock("• Порядок оплаты: 50% предоплата перед стартом работы, 50% после утверждения финальных макетов.\n• Гарантии: 2 раунда правок на каждом этапе входят в стоимость проекта.\n• Все исходные векторные файлы (AI, EPS, SVG, PDF) и шрифты передаются клиенту в полную собственность.\n• Срок действия предложения: 14 дней с даты отправки.")
    ]
  }
];

// SectionOffre
if (props.sectionOffre && props.sectionOffre[0]) {
  props.sectionOffre[0].speech = [
    makeBlock("Первичная упаковка (лоток, пакет, плёнка) держит контакт с продуктом и заморозку."),
    makeBlock("Крафт-рукав, стикер или бумажный поясок сверху несёт бренд и снимает ощущение магазина полуфабрикатов — это и держит позиционирование выше эконом-сегмента.")
  ];
}

// Jobs
const newJobsData = [
  { name: "1. Нейминг и проверка ТМ (150 000 ₸)", duration: "1 нед." },
  { name: "2. Визуальная система и упаковка (600 000 ₸)", duration: "2-3 нед." },
  { name: "3. Точка продаж и внедрение (100 000 ₸)", duration: "3-5 дн." },
  { name: "ИТОГОВЫЙ БЮДЖЕТ (850 000 ₸)", duration: "6-7 нед." },
  { name: "Условия оплаты (50% аванс / 50% финал)", duration: "50 / 50" },
  { name: "Правки (2 раунда) и передача всех прав", duration: "Гарантии" }
];

if (props.jobs) {
  props.jobs.forEach((j, i) => {
    if (newJobsData[i]) {
      j.name = newJobsData[i].name;
      j.duration = newJobsData[i].duration;
    }
  });
}

// Reglages
if (props.reglages && props.reglages[0]) {
  const reg = props.reglages[0];
  reg.metatitle = "КП — Брендинг и упаковка для бренда готовой еды (Актау)";
  reg.metadesc = "Комплексная разработка бренда готовой замороженной еды в Актау: нейминг, позиционирование, айдентика, упаковка 4 категорий и точка продаж.";
  reg.venezDecouvrir = "Локация проекта: первая точка в г. Актау";
  reg.telephone = "+7 (777) 000-00-00";
  reg.email = "hello@yapil.art";
  reg.rdvLink = "https://t.me/yapil";
  reg.rdvLinkStudio = "https://t.me/yapil";
  reg.legal = [
    makeBlock("УСЛОВИЯ РАБОТЫ:"),
    makeBlock("1. Оплата: 50% предоплата перед стартом работы, 50% после утверждения финальных макетов."),
    makeBlock("2. Правки: два раунда правок на каждом этапе входят в стоимость, дополнительные раунды оплачиваются отдельно."),
    makeBlock("3. Клиент утверждает каждый этап письменно перед переходом к следующему."),
    makeBlock("4. Все исходные файлы (векторные макеты, шрифты, гайдлайн) передаются клиенту после полной оплаты."),
    makeBlock("5. Предложение действует 14 дней с даты отправки.")
  ];
}

const updatedNextDataJson = JSON.stringify(nextData);
const sTag = '<script id="__NEXT_DATA__" type="application/json">';
const eTag = '</script>';
const iStart = qudeHtml.indexOf(sTag);
const iEnd = qudeHtml.indexOf(eTag, iStart);

let finalHtml = qudeHtml.slice(0, iStart + sTag.length) + updatedNextDataJson + qudeHtml.slice(iEnd);

finalHtml = finalHtml.replace('<script src="/reference-loader.js"></script>', '<script src="/aktau-loader.js"></script>');
finalHtml = finalHtml.replace(/<title>.*?<\/title>/, '<title>КП — Брендинг и упаковка для бренда готовой еды (Актау)</title>');

// Static 4-card HTML replacement
const staticCardsHtml = `<div class="cardsOffre mt-[45px] lg:mt-[120px]"><article class="origin-top lg:min-h-[545px] bg-blanc rounded-[10px] text-noir px-[25px] lg:px-[80px] py-[25px] lg:py-[50px] my-[20px] lg:my-[0px] group grid auto-rows-max-remove grid-rows-[auto_1fr] md:grid-cols-2 xl:grid-cols-[60%_auto] lg:sticky lg:top-[60px]"><div class="lg:col-span-2 lg:order-[-1] lg:pb-[20px] lg:border-b-[1px] lg:border-[#ddd] flex flex-wrap items-baseline justify-between gap-[10px]"><h3 class="h4 uppercase">1. Нейминг и стратегия</h3><span class="text-[18px] lg:text-[24px] font-mono font-medium text-rouge tracking-tight">150 000 ₸</span></div><span class="block group-[:nth-of-type(1)]:text-jaune group-[:nth-of-type(2)]:text-bleu group-[:nth-of-type(3)]:text-vert group-[:nth-of-type(4)]:text-rouge text-[30px] lg:text-[307px] tracking-[-0.02em] leading-[1] lg:leading-[0.75] self-center lg:self-end justify-self-end lg:justify-self-start">1</span><div class="pt-[5px] lg:max-w-[380px] col-span-2 lg:self-end lg:col-span-1 mt-[20px] border-t-[1px] border-[#ddd] lg:border-[0]"><div class="my-[15px]"><p>Разработка 5–8 вариантов названия<br/>с юридической проверкой в реестре ТМ РК (1 неделя)</p></div><div class="portableText grid gap-[15px_0] my-[15px] lg:mt-[15px] lg:mb-[15px]"><p>• Разработка 5–8 вариантов названия под критерии клиента и специфику рынка готовой еды.<br/>• Экспресс-проверка на занятость и охраноспособность в государственном реестре товарных знаков РК.<br/>• Финальная рекомендация приоритетного названия с полным маркетинговым обоснованием.</p><p>• Формулировка позиционирования: домашнее качество + современный формат без ухода в дешёвые полуфабрикаты.<br/>• Архитектура бренда: масштабируемая система под основные блюда, супы, гарниры и соусы.<br/>• Тон коммуникации (Tone of Voice) для розницы, доставки и B2B.</p></div></div><div class="trame opacity-0 pointer-events-none absolute inset-0 bg-[#000] rounded-[10px] "></div></article><article class="origin-top lg:min-h-[545px] bg-blanc rounded-[10px] text-noir px-[25px] lg:px-[80px] py-[25px] lg:py-[50px] my-[20px] lg:my-[0px] group grid auto-rows-max-remove grid-rows-[auto_1fr] md:grid-cols-2 xl:grid-cols-[60%_auto] lg:sticky lg:top-[60px] lg:translate-y-[40px]"><div class="lg:col-span-2 lg:order-[-1] lg:pb-[20px] lg:border-b-[1px] lg:border-[#ddd] flex flex-wrap items-baseline justify-between gap-[10px]"><h3 class="h4 uppercase">2. Визуальная система и упаковка</h3><span class="text-[18px] lg:text-[24px] font-mono font-medium text-rouge tracking-tight">600 000 ₸</span></div><span class="block group-[:nth-of-type(1)]:text-jaune group-[:nth-of-type(2)]:text-bleu group-[:nth-of-type(3)]:text-vert group-[:nth-of-type(4)]:text-rouge text-[30px] lg:text-[307px] tracking-[-0.02em] leading-[1] lg:leading-[0.75] self-center lg:self-end justify-self-end lg:justify-self-start">2</span><div class="pt-[5px] lg:max-w-[380px] col-span-2 lg:self-end lg:col-span-1 mt-[20px] border-t-[1px] border-[#ddd] lg:border-[0]"><div class="my-[15px]"><p>Фирменный стиль, брендбук и готовые макеты<br/>для 4 продуктовых категорий (2–3 недели)</p></div><div class="portableText grid gap-[15px_0] my-[15px] lg:mt-[15px] lg:mb-[15px]"><p>• Айдентика бренда: логотип (горизонтальная и вертикальная версии, знак/монограмма), фирменные цвета (Pantone, CMYK, RGB), шрифтовая пара, стилеобразующая графика.<br/>• Брендбук-гайдлайн в PDF по правилам использования стиля для внутренней команды и типографий.</p><p>• Дизайн-концепции упаковки для 4 продуктовых линеек: основные блюда, супы, гарниры, соусы.<br/>• Техническая проработка под шоковую заморозку (-35°C), защиту от конденсата и эргономику розничной витрины.<br/>• Финальные векторные препресс-макеты (AI/PDF) с линиями реза и сгиба, полностью готовые к сдаче в печать.</p></div></div><div class="trame opacity-0 pointer-events-none absolute inset-0 bg-[#000] rounded-[10px] "></div></article><article class="origin-top lg:min-h-[545px] bg-blanc rounded-[10px] text-noir px-[25px] lg:px-[80px] py-[25px] lg:py-[50px] my-[20px] lg:my-[0px] group grid auto-rows-max-remove grid-rows-[auto_1fr] md:grid-cols-2 xl:grid-cols-[60%_auto] lg:sticky lg:top-[60px] lg:translate-y-[80px]"><div class="lg:col-span-2 lg:order-[-1] lg:pb-[20px] lg:border-b-[1px] lg:border-[#ddd] flex flex-wrap items-baseline justify-between gap-[10px]"><h3 class="h4 uppercase">3. Точка продаж и внедрение</h3><span class="text-[18px] lg:text-[24px] font-mono font-medium text-rouge tracking-tight">100 000 ₸</span></div><span class="block group-[:nth-of-type(1)]:text-jaune group-[:nth-of-type(2)]:text-bleu group-[:nth-of-type(3)]:text-vert group-[:nth-of-type(4)]:text-rouge text-[30px] lg:text-[307px] tracking-[-0.02em] leading-[1] lg:leading-[0.75] self-center lg:self-end justify-self-end lg:justify-self-start">3</span><div class="pt-[5px] lg:max-w-[380px] col-span-2 lg:self-end lg:col-span-1 mt-[20px] border-t-[1px] border-[#ddd] lg:border-[0]"><div class="my-[15px]"><p>Оформление первой точки в Актау<br/>и сопровождение запуска (3–5 дней)</p></div><div class="portableText grid gap-[15px_0] my-[15px] lg:mt-[15px] lg:mb-[15px]"><p>• Базовые указания по оформлению торгового зала и входной группы на первой точке в г. Актау.<br/>• Векторный макет фасадной световой вывески для производства наружной рекламы.</p><p>• Гайдлайн по брендированию и оформлению розничной холодильной витрины готовой еды.<br/>• Авторский надзор: сопровождение цветопроб и консультации технологов типографии при запуске тиража.</p></div></div><div class="trame opacity-0 pointer-events-none absolute inset-0 bg-[#000] rounded-[10px] "></div></article><article class="origin-top lg:min-h-[545px] bg-blanc rounded-[10px] text-noir px-[25px] lg:px-[80px] py-[25px] lg:py-[50px] my-[20px] lg:my-[0px] group grid auto-rows-max-remove grid-rows-[auto_1fr] md:grid-cols-2 xl:grid-cols-[60%_auto] lg:sticky lg:top-[60px] last:relative last:top-0 lg:last:mb-0 lg:translate-y-[120px]"><div class="lg:col-span-2 lg:order-[-1] lg:pb-[20px] lg:border-b-[1px] lg:border-[#ddd] flex flex-wrap items-baseline justify-between gap-[10px]"><h3 class="h4 uppercase">4. Итоговый бюджет</h3><span class="text-[18px] lg:text-[24px] font-mono font-medium text-rouge tracking-tight">850 000 ₸</span></div><span class="block group-[:nth-of-type(1)]:text-jaune group-[:nth-of-type(2)]:text-bleu group-[:nth-of-type(3)]:text-vert group-[:nth-of-type(4)]:text-rouge text-[30px] lg:text-[307px] tracking-[-0.02em] leading-[1] lg:leading-[0.75] self-center lg:self-end justify-self-end lg:justify-self-start">4</span><div class="pt-[5px] lg:max-w-[380px] col-span-2 lg:self-end lg:col-span-1 mt-[20px] border-t-[1px] border-[#ddd] lg:border-[0]"><div class="my-[15px]"><p>Комплексный запуск бренда «под ключ»<br/>за 6–7 недель с гарантией результата</p></div><div class="portableText grid gap-[15px_0] my-[15px] lg:mt-[15px] lg:mb-[15px]"><p>• Полный комплекс работ: Нейминг и проверка ТМ + Визуальная система + Упаковка 4 категорий + Оформление точки продаж в Актау.<br/>• Сроки проекта: 6–7 недель от старта до готовых тиражных макетов для типографии.</p><p>• Оплата: 50% предоплата перед стартом работы, 50% после утверждения финальных макетов.<br/>• Правки: 2 раунда правок на каждом этапе входят в стоимость проекта.<br/>• Все исходные векторные файлы (AI, EPS, SVG, PDF) и шрифты передаются клиенту в полную собственность.<br/>• Срок действия КП: 14 дней с даты отправки.</p></div></div><div class="trame opacity-0 pointer-events-none absolute inset-0 bg-[#000] rounded-[10px] "></div></article></div>`;

const cardsStart = finalHtml.indexOf('<div class="cardsOffre');
const cardsEnd = finalHtml.indexOf('<div class="endText', cardsStart);
if (cardsStart !== -1 && cardsEnd !== -1) {
  finalHtml = finalHtml.slice(0, cardsStart) + staticCardsHtml + finalHtml.slice(cardsEnd);
}

// Add Oranienbaum font links and heading styles to head
const oranienbaumHead = `
<link rel="preload" href="https://media.yapil.art/fonts/oranienbaum-cyrillic.076ad3ef04f90d2d.woff2" as="font" type="font/woff2" crossorigin="anonymous"/>
<link rel="preload" href="https://media.yapil.art/fonts/oranienbaum-latin.9e993f98e6f9e858.woff2" as="font" type="font/woff2" crossorigin="anonymous"/>
<style id="oranienbaum-headings">
@font-face {
  font-family: 'Oranienbaum';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://media.yapil.art/fonts/oranienbaum-cyrillic.076ad3ef04f90d2d.woff2') format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: 'Oranienbaum';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://media.yapil.art/fonts/oranienbaum-latin.9e993f98e6f9e858.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Oranienbaum';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://media.yapil.art/fonts/oranienbaum-cyrillic-ext.f3dab925ebbfbc7a.woff2') format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
@font-face {
  font-family: 'Oranienbaum';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://media.yapil.art/fonts/oranienbaum-latin-ext.036db24ce1a8d823.woff2') format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}

h1, h2, h3, h4, h5, h6,
.h1, .h2, .h3, .h4, .h5, .h6,
.textAnimation,
.Studio h2,
#startOffre h2,
#Metiers h2,
#record .h2,
.cardsOffre h3 {
  font-family: 'Oranienbaum', Georgia, serif !important;
  font-weight: 400 !important;
  letter-spacing: -0.015em !important;
}

.cardsOffre article:nth-of-type(4) > span {
  color: #FD4B32 !important;
}

@media (min-width: 1000px) {
  .lg\\:translate-y-\\[120px\\],
  .cardsOffre article:nth-of-type(4) {
    --tw-translate-y: 120px !important;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important;
  }
}
</style>
</head>`;

finalHtml = finalHtml.replace('</head>', oranienbaumHead);

fs.writeFileSync(path.join(publicDir, "aktau.html"), finalHtml);
console.log("Written aktau.html with 4 cards and Oranienbaum typography completely");

