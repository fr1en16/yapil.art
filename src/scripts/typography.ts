const SKIP_SELECTOR = [
  'script',
  'style',
  'code',
  'pre',
  'textarea',
  'input',
  'select',
  'option',
  '[contenteditable="true"]',
  '[data-typography="off"]',
].join(',');

const BINDING_WORDS = {
  ru: [
    'а', 'без', 'близ', 'бы', 'будто', 'в', 'во', 'вне', 'да', 'для', 'до',
    'же', 'за', 'зато', 'и', 'из', 'из-за', 'из-под', 'или', 'к', 'как', 'когда',
    'ко', 'кроме', 'ли', 'либо', 'меж', 'на', 'над', 'не', 'нежели', 'ни', 'но',
    'о', 'об', 'обо', 'однако', 'от', 'перед', 'по', 'под', 'пока', 'при', 'про',
    'ради', 'с', 'словно', 'со', 'также', 'то', 'тоже', 'у', 'хотя', 'чем',
    'через', 'что', 'чтоб', 'чтобы', 'если',
  ],
  en: [
    'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'if', 'in', 'nor',
    'of', 'on', 'or', 'so', 'the', 'to', 'up', 'via', 'with', 'yet',
  ],
} as const;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const patterns = Object.fromEntries(
  Object.entries(BINDING_WORDS).map(([language, words]) => [
    language,
    new RegExp(
      `(^|[\\s\\u00a0([{«„"'])(${[...words]
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join('|')})[ \\t]+(?=\\S)`,
      'giu',
    ),
  ]),
) as Record<keyof typeof BINDING_WORDS, RegExp>;

function getPageLanguage(): keyof typeof BINDING_WORDS {
  return document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'ru';
}

export function bindServiceWords(value: string, language = getPageLanguage()): string {
  const pattern = patterns[language];
  let result = value;
  let previous: string;

  // Несколько проходов нужны для цепочек вроде «и в этом случае».
  do {
    previous = result;
    pattern.lastIndex = 0;
    result = result.replace(pattern, '$1$2\u00a0');
  } while (result !== previous);

  return result;
}

function canProcess(node: Text): boolean {
  const parent = node.parentElement;
  return Boolean(parent && node.data.trim() && !parent.closest(SKIP_SELECTOR));
}

function processTextNode(node: Text): void {
  if (!canProcess(node)) return;

  const nextValue = bindServiceWords(node.data);
  if (nextValue !== node.data) node.data = nextValue;
}

function processTree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) {
    processTextNode(root as Text);
    return;
  }

  if (!(root instanceof Element || root instanceof Document || root instanceof DocumentFragment)) return;
  if (root instanceof Element && root.matches(SKIP_SELECTOR)) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    processTextNode(current as Text);
    current = walker.nextNode();
  }
}

let observer: MutationObserver | undefined;

function applyTypographyRules(): void {
  observer?.disconnect();
  processTree(document.body);

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        processTextNode(mutation.target as Text);
        continue;
      }

      mutation.addedNodes.forEach(processTree);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export function installTypographyRules(): void {
  if (document.readyState === 'complete') {
    applyTypographyRules();
  } else {
    window.addEventListener('load', applyTypographyRules, { once: true });
  }

  document.addEventListener('astro:page-load', applyTypographyRules);
}
