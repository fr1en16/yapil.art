import React, { useMemo, useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { submitLead } from '../../lib/crmStore';
import { getWhatsAppUrl } from '../../utils/messengerLinks';

type BranchKey = 'A' | 'B' | 'C' | 'D';

interface BranchOption {
  shortName: string;
  title: string;
  desc: string;
  days: [number, number];
  budget: [number, number];
}

const MAIN_TASKS: { key: BranchKey; label: string; branchTitle: string }[] = [
  {
    key: 'A',
    label: 'Продать конкретную услугу, собрать лиды на акцию или рекламу',
    branchTitle: 'Лендинг',
  },
  {
    key: 'B',
    label: 'Презентовать компанию, показать портфолио и прайс-лист',
    branchTitle: 'Корпоративный сайт / Каталог',
  },
  {
    key: 'C',
    label: 'Продавать товары онлайн с корзиной и оплатой',
    branchTitle: 'Интернет-магазин',
  },
  {
    key: 'D',
    label: 'Автоматизировать бизнес: онлайн-запись, личный кабинет, кастомный сервис',
    branchTitle: 'Web App / PRO',
  },
];

const BRANCH_QUESTIONS: Record<BranchKey, { question: string; options: BranchOption[] }> = {
  A: {
    question: 'Какой формат одностраничника вам нужен?',
    options: [
      { shortName: 'Экспресс-лендинг', title: 'Экспресс-лендинг (4–5 экранов)', desc: 'УТП, выгоды, отзывы, форма заказа', days: [3, 5], budget: [150000, 220000] },
      { shortName: 'Promo-лендинг', title: 'Promo-Landing (7–10 экранов)', desc: 'Кейсы, видео-блоки, FAQ, калькулятор', days: [5, 7], budget: [220000, 320000] },
      { shortName: 'Квиз-лендинг', title: 'Квиз-лендинг', desc: 'Опросник для автоподбора услуги и сбора контактов', days: [5, 7], budget: [200000, 300000] },
    ],
  },
  B: {
    question: 'Какой масштаб каталога и разделов планируете?',
    options: [
      { shortName: 'Сайт компании', title: 'Сайт компании (до 5 страниц)', desc: 'О нас, Услуги, Галерея, Команда, Контакты', days: [5, 7], budget: [260000, 360000] },
      { shortName: 'Каталог', title: 'Каталог услуг или B2B-продукции', desc: 'Рубрикатор, карточки, фильтры по параметрам', days: [5, 7], budget: [280000, 410000] },
      { shortName: 'Презентационный сайт', title: 'Презентационный сайт с 3D-графикой и анимацией', desc: 'Для брендов, которым важна подача', days: [7, 10], budget: [420000, 600000] },
    ],
  },
  C: {
    question: 'Сколько товаров и как ведёте учёт?',
    options: [
      { shortName: 'Магазин до 50 товаров', title: 'Небольшой магазин (до 30–50 товаров)', desc: 'Заказ в WhatsApp, простая корзина, ручное обновление', days: [7, 10], budget: [380000, 550000] },
      { shortName: 'Магазин 100–3000+ SKU', title: 'Магазин на 100–3 000+ SKU', desc: 'Фильтры, поиск, онлайн-оплата, выгрузка в Excel', days: [10, 14], budget: [550000, 850000] },
      { shortName: 'Магазин со складом', title: 'Синхронизация со складом', desc: 'Связка с «1С:Предприятие» или МойСклад', days: [12, 16], budget: [700000, 1100000] },
    ],
  },
  D: {
    question: 'Какой кастомный функционал требуется?',
    options: [
      { shortName: 'Личный кабинет', title: 'Личный кабинет клиента', desc: 'Авторизация по номеру, история заказов, баланс', days: [10, 14], budget: [650000, 950000] },
      { shortName: 'Бронирование', title: 'Система бронирования и записи', desc: 'Выбор времени, специалистов и слотов', days: [10, 14], budget: [700000, 1000000] },
      { shortName: 'ИИ-менеджер', title: 'Встроенный ИИ-менеджер', desc: 'Бот на ваших прайсах, отвечает клиентам круглосуточно', days: [12, 16], budget: [800000, 1200000] },
    ],
  },
};

const MATERIALS_OPTIONS = [
  { id: 'blank', label: 'Есть только идея и ниша', desc: 'Нужно всё с нуля: структура, тексты, генерация фото и графики' },
  { id: 'text', label: 'Есть текст и прайс, нет визуала', desc: 'Нужен дизайн, генерация изображений товаров и вёрстка' },
  { id: 'brand', label: 'Есть фирменный стиль и фото', desc: 'Нужно собрать по вашему брендбуку на чистом коде' },
];

interface IntegrationOption {
  id: string;
  label: string;
  price: number;
  suffix?: string;
  locked?: boolean;
}

const INTEGRATIONS: IntegrationOption[] = [
  { id: 'wa', label: 'Отправка заявок в WhatsApp и Telegram (бесплатно)', price: 0, locked: true },
  { id: 'kaspi', label: 'Приём оплат Kaspi Pay и Kaspi QR', price: 40000, suffix: 'с приёмом Kaspi Pay' },
  { id: 'acquiring', label: 'Эквайринг картами (Freedom Pay, Halyk, CloudPayments)', price: 50000, suffix: 'с приёмом карт' },
  { id: 'crm', label: 'Интеграция с CRM (AmoCRM, Bitrix24)', price: 60000, suffix: 'и CRM-интеграцией' },
  { id: 'kzhost', label: 'Хостинг в зоне .KZ по требованиям РК', price: 15000 },
];

const URGENCY_OPTIONS = [
  { id: 'urgent', label: '«Горит»', desc: 'Запуск за 3–4 дня под рекламу или событие' },
  { id: 'normal', label: 'В обычном темпе', desc: '1–2 недели' },
  { id: 'planned', label: 'Планирую заранее', desc: 'Готовлюсь к следующему месяцу' },
];

const TOTAL_STEPS = 5;

export default function AiCalculator() {
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<BranchKey | null>(null);
  const [optionIdx, setOptionIdx] = useState<number | null>(null);
  const [materials, setMaterials] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<string[]>(['wa']);
  const [urgency, setUrgency] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const branchOption = branch && optionIdx !== null ? BRANCH_QUESTIONS[branch].options[optionIdx] : null;

  const result = useMemo(() => {
    if (!branchOption) return null;

    let [dMin, dMax] = branchOption.days;
    let [bMin, bMax] = branchOption.budget;

    integrations.forEach((id) => {
      const found = INTEGRATIONS.find((i) => i.id === id);
      if (found) {
        bMin += found.price;
        bMax += found.price;
      }
    });

    let urgencyNote = '';
    if (urgency === 'urgent') {
      const rush = branch === 'A' ? [3, 4] : [Math.max(3, Math.round(dMin * 0.7)), Math.max(dMin, Math.round(dMax * 0.8))];
      dMin = rush[0];
      dMax = rush[1];
      bMin = Math.round((bMin * 1.15) / 10000) * 10000;
      bMax = Math.round((bMax * 1.15) / 10000) * 10000;
      urgencyNote = 'Срочный запуск: приоритетный поток разработки, +15% к смете';
    } else if (urgency === 'planned') {
      urgencyNote = 'Фиксируем удобный слот в календаре — старт без спешки';
    }

    const suffixPriority = ['kaspi', 'acquiring', 'crm'];
    const activeSuffix = suffixPriority.find((id) => integrations.includes(id));
    const suffixLabel = activeSuffix ? INTEGRATIONS.find((i) => i.id === activeSuffix)?.suffix : undefined;
    const projectName = suffixLabel ? `${branchOption.shortName} ${suffixLabel}` : branchOption.shortName;

    return {
      projectName,
      days: [dMin, dMax] as [number, number],
      budget: [bMin, bMax] as [number, number],
      urgencyNote,
    };
  }, [branchOption, integrations, urgency, branch]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let digits = val.replace(/\D/g, '');
    if (!digits) {
      setPhone('');
      return;
    }
    if (digits.length > 11 && (digits.startsWith('77') || digits.startsWith('78'))) {
      digits = digits.slice(1);
    }
    let raw = digits;
    if (raw.startsWith('8') || raw.startsWith('7')) {
      raw = '7' + raw.slice(1);
    } else {
      raw = '7' + raw;
    }
    raw = raw.slice(0, 11);

    let res = '+7';
    if (raw.length > 1) res += ' (' + raw.slice(1, 4);
    if (raw.length > 4) res += ') ' + raw.slice(4, 7);
    if (raw.length > 7) res += '-' + raw.slice(7, 9);
    if (raw.length > 9) res += '-' + raw.slice(9, 11);
    setPhone(res);
    if (errors.phone && raw.length === 11) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const toggleIntegration = (id: string) => {
    if (id === 'wa') return;
    setIntegrations((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const selectMainTask = (key: BranchKey) => {
    setBranch(key);
    setOptionIdx(null);
    setStep(2);
  };

  const selectBranchOption = (idx: number) => {
    setOptionIdx(idx);
    setStep(3);
  };

  const selectMaterials = (id: string) => {
    setMaterials(id);
    setStep(4);
  };

  const selectUrgency = (id: string) => {
    setUrgency(id);
    setStep(6);
  };

  const reset = () => {
    setStep(1);
    setBranch(null);
    setOptionIdx(null);
    setMaterials(null);
    setIntegrations(['wa']);
    setUrgency(null);
    setPhone('');
    setIsSubmitted(false);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!phone.trim() || digits.length < 11) {
      setErrors({ phone: 'Укажите номер телефона полностью' });
      return;
    }
    if (!result || !branch) return;

    setIsSubmitting(true);

    const materialsLabel = MATERIALS_OPTIONS.find((m) => m.id === materials)?.label || '';
    const summary = `Проект: ${result.projectName}\nСрок: ${result.days[0]}–${result.days[1]} дн.\nБюджет: ${result.budget[0].toLocaleString('ru-RU')}–${result.budget[1].toLocaleString('ru-RU')} ₸\nИсходники: ${materialsLabel}`;

    submitLead({
      name: 'Заявка из калькулятора',
      phone: phone.trim(),
      services: [MAIN_TASKS.find((t) => t.key === branch)?.branchTitle || 'Сайт'],
      message: summary,
      budget: `${result.budget[0].toLocaleString('ru-RU')} – ${result.budget[1].toLocaleString('ru-RU')} ₸`,
      source: 'calculator',
      sourceDetails: `Калькулятор: ${result.projectName}`,
    }).catch((err) => console.error('CRM submit error:', err));

    const waUrl = getWhatsAppUrl({
      pageUrl: window.location.href,
      sourceContext: 'calculator',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const visualStep = Math.min(step, TOTAL_STEPS);

  return (
    <div className="w-full">
      {/* Progress dots */}
      {step <= TOTAL_STEPS && (
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 transition-colors duration-300 ${i + 1 <= visualStep ? 'bg-[#FD4B32]' : 'bg-white/10'}`}
            />
          ))}
        </div>
      )}

      {step > 1 && step <= TOTAL_STEPS && (
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 mb-6 text-sm text-white/50 hover:text-white transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0"
        >
          ← Назад
        </button>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-lg sm:text-xl text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Какая основная задача сайта?
          </legend>
          <div className="flex flex-col gap-3">
            {MAIN_TASKS.map((task) => (
              <button
                key={task.key}
                type="button"
                onClick={() => selectMainTask(task.key)}
                className="group text-left w-full px-5 py-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FD4B32]/50 transition-all duration-300 cursor-pointer flex items-center justify-between gap-4"
              >
                <span className="text-sm sm:text-base text-white/85 group-hover:text-white">{task.label}</span>
                <ArrowRight className="size-4 text-white/30 group-hover:text-[#FD4B32] group-hover:translate-x-1 transition-all duration-300 shrink-0" />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Step 2 */}
      {step === 2 && branch && (
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-lg sm:text-xl text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            {BRANCH_QUESTIONS[branch].question}
          </legend>
          <div className="flex flex-col gap-3">
            {BRANCH_QUESTIONS[branch].options.map((opt, idx) => (
              <button
                key={opt.title}
                type="button"
                onClick={() => selectBranchOption(idx)}
                className="group text-left w-full px-5 py-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FD4B32]/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm sm:text-base font-medium text-white/90 group-hover:text-white">{opt.title}</span>
                  <span className="font-mono text-xs text-[#FD4B32] shrink-0">{opt.days[0]}–{opt.days[1]} дн.</span>
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-white/50">{opt.desc}</p>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-lg sm:text-xl text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Что у вас уже готово для сайта?
          </legend>
          <div className="flex flex-col gap-3">
            {MATERIALS_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMaterials(m.id)}
                className="group text-left w-full px-5 py-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FD4B32]/50 transition-all duration-300 cursor-pointer"
              >
                <span className="text-sm sm:text-base font-medium text-white/90 group-hover:text-white block mb-1">{m.label}</span>
                <span className="text-xs sm:text-sm text-white/50">{m.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-lg sm:text-xl text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Какие сервисы и способы оплаты подключить?
          </legend>
          <div className="flex flex-col gap-3 mb-6">
            {INTEGRATIONS.map((opt) => {
              const checked = integrations.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3.5 px-5 py-4 border transition-all duration-300 select-none ${
                    opt.locked ? 'cursor-default opacity-70' : 'cursor-pointer'
                  } ${checked ? 'border-[#FD4B32]/60 bg-[#FD4B32]/[0.06]' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={opt.locked}
                    onChange={() => toggleIntegration(opt.id)}
                    className="sr-only"
                  />
                  <div
                    className={`size-5 shrink-0 border flex items-center justify-center transition-all duration-300 ${
                      checked ? 'bg-[#FD4B32] border-[#FD4B32] text-white' : 'border-white/25 bg-transparent'
                    }`}
                  >
                    {checked && <Check className="size-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-sm text-white/85 flex-1">{opt.label}</span>
                  {opt.price > 0 && <span className="font-mono text-xs text-white/40">+{opt.price.toLocaleString('ru-RU')} ₸</span>}
                </label>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setStep(5)}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FD4B32] text-white text-sm font-semibold hover:bg-[#E63A22] transition-colors duration-300 cursor-pointer border-0"
          >
            Далее <ArrowRight className="size-4" />
          </button>
        </fieldset>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <fieldset className="border-0 p-0 m-0">
          <legend className="text-lg sm:text-xl text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
            Когда вам нужен работающий сайт?
          </legend>
          <div className="flex flex-col gap-3">
            {URGENCY_OPTIONS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => selectUrgency(u.id)}
                className="group text-left w-full px-5 py-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-[#FD4B32]/50 transition-all duration-300 cursor-pointer"
              >
                <span className="text-sm sm:text-base font-medium text-white/90 group-hover:text-white block mb-1">{u.label}</span>
                <span className="text-xs sm:text-sm text-white/50">{u.desc}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Result */}
      {step === 6 && result && (
        <div>
          <div className="border border-white/12 bg-white/[0.03] backdrop-blur-2xl">
            <div className="px-5 sm:px-7 py-5 border-b border-white/10">
              <span className="text-xs uppercase tracking-[0.08em] text-white/40 font-semibold">Ваш проект</span>
              <h3 className="mt-1.5 text-2xl sm:text-3xl text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {result.projectName}
              </h3>
            </div>
            <div className="px-5 sm:px-7 py-5 flex flex-col gap-3 text-sm sm:text-base border-b border-white/10">
              <div className="flex justify-between gap-4"><span className="text-white/50">Технология</span><span className="text-white/90 text-right">Собственный код, без конструктора</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">Загрузка</span><span className="text-white/90 text-right">0.8 сек на смартфоне</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">Дизайн</span><span className="text-white/90 text-right">Макет от дизайнера, графика по раскадровке</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">Абонентская плата</span><span className="text-white/90 text-right">0 ₸, код остаётся у вас</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">Срок</span><span className="text-white/90 text-right font-semibold">{result.days[0]}–{result.days[1]} рабочих дней</span></div>
              <div className="flex justify-between gap-4"><span className="text-white/50">Бюджет</span><span className="text-[#FD4B32] text-right font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>{result.budget[0].toLocaleString('ru-RU')} – {result.budget[1].toLocaleString('ru-RU')} ₸</span></div>
              {result.urgencyNote && <p className="text-xs text-white/40 mt-1">{result.urgencyNote}</p>}
            </div>

            <div className="px-5 sm:px-7 py-5">
              {isSubmitted ? (
                <div className="text-center py-4 space-y-4">
                  <div className="size-14 mx-auto border border-[#FD4B32]/40 bg-[#FD4B32]/10 text-[#FD4B32] flex items-center justify-center">
                    <Check className="size-7 stroke-[2.5]" />
                  </div>
                  <p className="text-white/85 text-sm sm:text-base">
                    Заявка отправлена, и мы открыли WhatsApp с готовым сообщением — просто нажмите «Отправить» в приложении.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/15 text-white/75 text-sm hover:border-white/30 hover:text-white transition-colors duration-300 cursor-pointer bg-transparent"
                  >
                    <RotateCcw className="size-3.5" /> Рассчитать другой проект
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <p className="text-xs sm:text-sm text-white/50">
                    Бонус при отправке сегодня: бесплатный драфт структуры первого экрана под вашу нишу.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      onFocus={() => { if (!phone) setPhone('+7 ('); }}
                      placeholder="+7 (___) ___-__-__"
                      className={`flex-1 px-4 py-3.5 bg-white/[0.04] border text-white placeholder-white/30 outline-none transition-colors duration-300 ${
                        errors.phone ? 'border-red-500' : 'border-white/10 focus:border-[#FD4B32]'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3.5 bg-[#FD4B32] text-white text-sm font-semibold hover:bg-[#E63A22] transition-colors duration-300 cursor-pointer border-0 whitespace-nowrap disabled:opacity-70"
                    >
                      {isSubmitting ? 'Отправка…' : 'Получить смету в WhatsApp'}
                    </button>
                  </div>
                  {errors.phone && <span className="block text-xs text-red-500">{errors.phone}</span>}
                </form>
              )}
            </div>
          </div>
          {!isSubmitted && (
            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors duration-200 bg-transparent border-0 cursor-pointer p-0"
            >
              <RotateCcw className="size-3" /> Начать заново
            </button>
          )}
        </div>
      )}
    </div>
  );
}
