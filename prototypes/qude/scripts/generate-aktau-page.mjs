import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

// Read original qude.html
const qudeHtml = fs.readFileSync(path.join(publicDir, "qude.html"), "utf8");

// Extract __NEXT_DATA__
const nextDataMatch = qudeHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (!nextDataMatch) throw new Error("Could not find __NEXT_DATA__");
const nextData = JSON.parse(nextDataMatch[1]);
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

// 1. Update intro
if (props.intro && props.intro[0]) {
  const intro = props.intro[0];
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

// 2. Update references (quotes & positioning)
if (props.references && props.references[0]) {
  const ref = props.references[0];
  ref.speech = [
    makeBlock("Формат совмещает собственное производство, фасовку, шоковую заморозку, хранение, торговый зал и выдачу доставки на одной точке в Актау.")
  ];
  ref.speechB = [
    makeBlock("Линейка на старте: основные блюда, супы, гарниры, соусы. Целевая аудитория — семьи и работающие люди, которым важно держать дома запас качественной готовой еды без ощущения магазина полуфабрикатов.")
  ];
}

// 3. Update podcasts (9 categories & key value props)
const newPodcastsData = [
  {
    name: "Основные блюда",
    dates: "Лоток СВЧ/духовка",
    episodes: "Категория 01",
    reward: undefined,
    skills: ["позиционирование", "термопленка", "печать"]
  },
  {
    name: "Супы",
    dates: "Миска + поясок",
    episodes: "Категория 02",
    reward: undefined,
    skills: ["окно-прорезь", "крафт-рукав", "дизайн"]
  },
  {
    name: "Гарниры",
    dates: "Формованный лоток",
    episodes: "Категория 03",
    reward: undefined,
    skills: ["шоковая-заморозка", "сочность", "препресс"]
  },
  {
    name: "Фирменные соусы",
    dates: "Саше малого объема",
    episodes: "Категория 04",
    reward: undefined,
    skills: ["герметичность", "удобство", "брендинг"]
  },
  {
    name: "Шоковая заморозка",
    dates: "-35°C контакт",
    episodes: "Техпроцесс",
    reward: "❄️ Качество вкуса",
    skills: ["сохранение-структуры", "свежесть", "стойкость"]
  },
  {
    name: "Крафт-рукав и поясок",
    dates: "Премиум-подача",
    episodes: "Позиционирование",
    reward: "✨ Выше эконома",
    skills: ["бренд-контакт", "окно-прорезь", "этикетка"]
  },
  {
    name: "Точка продаж: Актау",
    dates: "Зал + цех + доставка",
    episodes: "Первая точка",
    reward: undefined,
    skills: ["вывеска-вектор", "гайд-витрины", "фасад"]
  },
  {
    name: "Масштабирование в сеть",
    dates: "Готовность к росту",
    episodes: "Архитектура",
    reward: undefined,
    skills: ["защита-тм-рк", "линейка-меню", "гибкость"]
  },
  {
    name: "Сроки: 6–7 недель",
    dates: "4 этапа под ключ",
    episodes: "График запуска",
    reward: undefined,
    skills: ["нейминг-1нед", "айдентика-2нед", "упаковка-2нед", "точка-5дней"]
  }
];

if (props.podcasts) {
  props.podcasts.forEach((p, i) => {
    if (newPodcastsData[i]) {
      p.name = newPodcastsData[i].name;
      p.dates = newPodcastsData[i].dates;
      p.episodes = newPodcastsData[i].episodes;
      p.reward = newPodcastsData[i].reward;
      p.skills = newPodcastsData[i].skills;
    }
  });
}

// 4. Update offre (services tabs)
if (props.offre && props.offre.length >= 3) {
  props.offre[0].name = "1. Нейминг и стратегия";
  props.offre[0].chapeau = [
    makeBlock("Разработка 5-8 вариантов названия\nс юридической проверкой в реестре ТМ РК")
  ];
  props.offre[0].description = [
    makeBlock("• Разработка 5–8 вариантов названия под критерии клиента и специфику рынка.\n• Проверка на занятость в реестре товарных знаков Республики Казахстан.\n• Финальная рекомендация одного названия с полным обоснованием."),
    makeBlock("• Формулировка позиционирования: тепло и домашность + современность + качество без ухода в этно-ресторан или эконом-заморозку.\n• Архитектура бренда для линейки: блюда, супы, гарниры, соусы — с возможностью расширения категорий без пересборки идентики.\n• Тон коммуникации (Tone of Voice) для розницы, курьерской доставки и B2B.")
  ];

  props.offre[1].name = "2. Визуальная система и упаковка";
  props.offre[1].chapeau = [
    makeBlock("Фирменный стиль и готовые макеты\nдля 4 продуктовых категорий")
  ];
  props.offre[1].description = [
    makeBlock("• Логотип и его адаптации: вертикальная, горизонтальная версии, фирменный знак/монограмма.\n• Фирменные цвета (CMYK, Pantone, RGB, HEX), шрифтовая пара, стилеобразующая графика."),
    makeBlock("• Брендбук-гайдлайн в PDF по использованию стиля для внутренней команды и подрядчиков.\n• Дизайн-концепция упаковки для каждой категории: основные блюда, супы, гарниры, соусы.\n• Проработка материала и формата с учётом шоковой заморозки, конденсата и розничной витрины.\n• Финальные макеты в векторе (AI/PDF) с линиями реза и сгиба, готовые к передаче в типографию.")
  ];

  props.offre[2].name = "3. Точка продаж и внедрение";
  props.offre[2].chapeau = [
    makeBlock("Оформление первой точки в Актау\nи сопровождение запуска")
  ];
  props.offre[2].description = [
    makeBlock("• Базовые указания по оформлению торгового зала и входной группы на первой точке в г. Актау.\n• Векторный макет фасадной вывески для производства.\n• Гайдлайн по брендированию и оформлению розничной витрины.\n• Авторский надзор и консультации типографии при согласовании цветопроб и печати.")
  ];
}

// 5. Update sectionOffre (quote / philosophy)
if (props.sectionOffre && props.sectionOffre[0]) {
  props.sectionOffre[0].speech = [
    makeBlock("Первичная упаковка (лоток, пакет, плёнка) держит контакт с продуктом и заморозку."),
    makeBlock("Крафт-рукав, стикер или бумажный поясок сверху несёт бренд и снимает ощущение магазина полуфабрикатов — это и держит позиционирование выше эконом-сегмента.")
  ];
}

// 6. Update jobs (stages, timeline & pricing)
const newJobsData = [
  { name: "1. Нейминг и проверка ТМ", duration: "1 нед." },
  { name: "2. Визуальная система", duration: "2 нед." },
  { name: "3. Упаковка (4 категории)", duration: "2 нед." },
  { name: "4. Точка продаж (вывеска)", duration: "3-5 дн." },
  { name: "Итоговый бюджет (под ключ)", duration: "6-7 нед." },
  { name: "Условия оплаты", duration: "50 / 50" },
  { name: "Правки и гарантии", duration: "2 раунда" }
];

if (props.jobs) {
  props.jobs.forEach((j, i) => {
    if (newJobsData[i]) {
      j.name = newJobsData[i].name;
      j.duration = newJobsData[i].duration;
    }
  });
}

// 7. Update reglages
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
    makeBlock("УСЛОВИЯ РАБОТЫ И ВЗАИМОДЕЙСТВИЯ:"),
    makeBlock("1. Оплата: 50% предоплата перед стартом работы, 50% после утверждения финальных макетов."),
    makeBlock("2. Правки: два раунда правок на каждом этапе входят в стоимость, дополнительные раунды оплачиваются отдельно."),
    makeBlock("3. Клиент утверждает каждый этап письменно перед переходом к следующему."),
    makeBlock("4. Все исходные файлы (векторные макеты, шрифты, гайдлайн) передаются клиенту после полной оплаты."),
    makeBlock("5. Предложение действует 14 дней с даты отправки."),
    makeBlock("Сметные диапазоны:\n• Нейминг: 150 000–250 000 ₸\n• Визуальная система: 300 000–500 000 ₸\n• Упаковка (4 категории): 400 000–700 000 ₸\n• Оформление точки продаж: 100 000–180 000 ₸\n• Итого: 1 150 000–1 980 000 ₸\nСтоимость печати рассчитывается отдельно.")
  ];
}

// Rebuild HTML
const updatedNextDataJson = JSON.stringify(nextData);

const scriptStartTag = '<script id="__NEXT_DATA__" type="application/json">';
const scriptEndTag = '</script>';

const idxStart = qudeHtml.indexOf(scriptStartTag);
const idxEnd = qudeHtml.indexOf(scriptEndTag, idxStart);

let newHtml = qudeHtml.slice(0, idxStart + scriptStartTag.length) + updatedNextDataJson + qudeHtml.slice(idxEnd);

// Update loader script
newHtml = newHtml.replace('<script src="/reference-loader.js"></script>', '<script src="/aktau-loader.js"></script>');

// Update Title in HTML head
newHtml = newHtml.replace(/<title>.*?<\/title>/, '<title>КП — Брендинг и упаковка для бренда готовой еды (Актау)</title>');

// Update initial SSR strings
newHtml = newHtml.replace("Qude : production de podcasts Toulouse", "КП — Брендинг и упаковка для бренда готовой еды (Актау)");
newHtml = newHtml.replace(/Pour chaque projet, c’est une équipe de professionnels passionnés, sélectionnés et dédiés qui intervient à chaque étape et selon vos besoins/g,
  "Комплексная разработка бренда готовой замороженной еды в Актау: нейминг, позиционирование, айдентика, упаковка 4 категорий и точка продаж.");

newHtml = newHtml.replace("Agence", "Брендинг");
newHtml = newHtml.replace("Audio Crēative", "& Упаковка");
newHtml = newHtml.replace("Crēation, production & diffusion de podcasts.", "Бренд готовой замороженной еды.");
newHtml = newHtml.replace("À Toulouse. Et partout ailleurs.", "В Актау. С прицелом на сеть.");

newHtml = newHtml.replace("“ Créer un podcast,<br/>c&#x27;est donner la parole ”", "“ Качественная готовая еда<br/>без ощущения полуфабрикатов ”");

newHtml = newHtml.replace(
  "Dès l’enfance, j&#x27;ai été fasciné par la diversité et la force des émotions que pouvait procurer la musique.<br/>Puis je suis tombé amoureux de la radio.",
  "Клиент запускает новый продукт: собственное производство и розничная продажа готовой замороженной еды в Актау.<br/>Формат совмещает производство, фасовку, шоковую заморозку, хранение, торговый зал и выдачу доставки на одной точке."
);

newHtml = newHtml.replace(
  "J&#x27;ai évolué dans ce milieu, entouré de légendes. Et j’ai pris conscience de la puissance de la voix.",
  "После первого запуска планируется открытие дополнительных точек реализации с отдельным производственным цехом."
);

newHtml = newHtml.replace(
  "Aujourd’hui, le podcast est une évidence. Il est le son et le sens, en parfaite synergie.",
  "Линейка на старте: основные блюда, супы, гарниры, соусы. Целевая аудитория — семьи и работающие люди, которым важно держать дома запас качественной готовой еды без ощущения магазина полуфабрикатов."
);

newHtml = newHtml.replace(
  "Permettre à chacun de partager sa passion. De transmettre son émotion.<br/>Faire passer vos messages. Avec efficacité, esthétique, et plaisir. C’est notre métier.",
  "Рабочее название продукта не подходит для дальнейшего использования: слишком распространено и слабо защищается юридически.<br/>Нужен новый бренд, который выдержит рост в сеть и годится не только для супов."
);

newHtml = newHtml.replace("Écouter le manifeste", "Концепция проекта");
newHtml = newHtml.replace("Mathieu Viguié <br/>Fondateur de Qude", "Yapil Studio <br/>Коммерческое предложение");

newHtml = newHtml.replace("Vous avez une idée (vague) ?", "Собственное производство в Актау ?");
newHtml = newHtml.replace("Une envie (folle) ?<br>Un message (à crier) ?", "Шоковая заморозка и витрина ?<br>Линейка супов и горячих блюд ?");
newHtml = newHtml.replace("Besoin d'un petit coup de main ?", "Устарело рабочее название ?");
newHtml = newHtml.replace("Ou qu’on s’occupe de tout ?", "Нужен сильный бренд для сети ?");
newHtml = newHtml.replace("Vous êtes au bon endroit.", "Вы обратились по адресу.");

newHtml = newHtml.replace("Nous contacter", "Обсудить проект");

newHtml = newHtml.replace("Ensemble, mettons votre projet", "Создаём сильный бренд");
newHtml = newHtml.replace('<span class="textAnimation block">En forme</span>', '<span class="textAnimation block">В концепции</span>');
newHtml = newHtml.replace('<span class="textAnimation block">En son</span>', '<span class="textAnimation block">В дизайне</span>');
newHtml = newHtml.replace('<span class="textAnimation block">En ligne</span>', '<span class="textAnimation block">В ритейле</span>');

newHtml = newHtml.replace(
  "Institutions, sociétés, créateurs indépendants, clubs de sport, associations, marques...",
  "Формат совмещает собственное производство, фасовку, шоковую заморозку, хранение, торговый зал и выдачу доставки на одной точке."
);
newHtml = newHtml.replace(
  "Et demain, qui sait ? Les introvertis, les avant-gardistes, les originaux, les expansifs, les anciens, les rêveurs, les spirituels ? Vous ?",
  "Линейка на старте: основные блюда, супы, гарниры, соусы. Целевая аудитория — семьи и работающие люди, ценящие домашний вкус и время."
);

newHtml = newHtml.replace("Conceptualisation", "Нейминг");
newHtml = newHtml.replace("Rédaction", "Патент ТМ РК");
newHtml = newHtml.replace("Voix off", "Позиционирование");
newHtml = newHtml.replace("Identité sonore", "Архитектура");
newHtml = newHtml.replace("Enregistrement", "Логотип & Знак");
newHtml = newHtml.replace("Montage", "Брендбук-гайдлайн");
newHtml = newHtml.replace("Sound Design", "Дизайн упаковки");
newHtml = newHtml.replace("Mixage", "Препресс-макеты");
newHtml = newHtml.replace("Diffusion", "Оформление витрин");

newHtml = newHtml.replace("Chez Qude, on n’a pas de petits ni de gros projets. On n’a que de l’humain, de la créativité, du partage.",
  "Первичная упаковка (лоток, пакет, плёнка) держит контакт с продуктом и заморозку.");
newHtml = newHtml.replace("Chaque podcast doit être une succession de moments de plaisir. De moments d&#x27;exception. La conception, la production, la diffusion. Et l&#x27;écoute.",
  "Крафт-рукав, стикер или бумажный поясок сверху несёт бренд и снимает ощущение магазина полуфабрикатов — это и держит позиционирование выше эконом-сегмента.");

newHtml = newHtml.replace("Venez découvrir ou réserver le studio", "Локация проекта: первая точка в г. Актау");
newHtml = newHtml.replace("266, avenue de Lardenne<br/>31100 Toulouse", "г. Актау, Казахстан<br/>Мангистауская область");

newHtml = newHtml.replace("Let&#x27;s talk", "Обсудить проект");
newHtml = newHtml.replace("Prise de contact, témoignage ou simple bonjour...", "Есть вопросы по этапам или смете ?");
newHtml = newHtml.replace("Laissez nous un message audio<br/>et vos coordonnées si vous souhaitez être recontacté.", "Оставьте заявку или свяжитесь удобным способом —<br/>обсудим детали запуска в Актау.");

// Write public/aktau.html
fs.writeFileSync(path.join(publicDir, "aktau.html"), newHtml);
console.log("Successfully written public/aktau.html");
