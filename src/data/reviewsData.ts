export interface ReviewSection {
  title: string;
  items?: string[];
  text?: string;
}

export interface FullReviewData {
  lead?: string;
  paragraphs?: string[];
  sections?: ReviewSection[];
}

export interface ReviewItem {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  projectTitle: string;
  projectUrl: string;
  projectImage: string;
  quote: string;
  fullReview?: FullReviewData;
}

// Typographer function to bind hanging prepositions, conjunctions, and particles with non-breaking spaces
export function typograph(text: string): string {
  if (!text) return '';
  return text
    .replace(/(^|[\s«"'(])([а-яА-ЯёЁa-zA-Z]{1,2})\s+/g, '$1$2\u00A0')
    .replace(/\s+([—–])\s+/g, '\u00A0$1 ')
    .replace(/\s+(же|ли|бы|ж|ль|б)([\s.,;:!?]|$)/g, '\u00A0$1$2');
}

export const reviewsData: ReviewItem[] = [
  {
    id: 'rv',
    author: 'Роман Рыкунов',
    role: 'Продюсер',
    company: 'Рыкунов и Кудряшов',
    avatar: '/reviews/roman-rykunov.webp',
    projectTitle: 'Рыкунов и Кудряшов',
    projectUrl: '/case/rv',
    projectImage: '/case/rv.webp',
    quote:
      'Сотрудничаем с Яшей с 2020 года. За это время реализовали огромный объем работы и запустили множество сайтов. Это специалист, который работает быстро, качественно и всегда готов выручить в сжатые сроки. Яша не только крутой профессионал, но и отличный человек. Он всегда делает свою работу качественно, а его визуальные решения одни из лучших. Однозначно рекомендую к сотрудничеству!',
    fullReview: {
      lead: 'Так, друзья, всем привет. Яков, привет. Хотел оставить отзыв о работе с тобой, потому что я, наверное, либо самый древний, либо один из самых древних клиентов, потому что я работаю с тобой с двадцатого года, с начала двадцатого года.',
      paragraphs: [
        'И за эти три с лишним года мы проделали очень большую работу. Мы сделали очень много сайтов, и хочется тебе сказать просто искреннее спасибо, потому что ты очень много где выручал и до сих пор выручаешь.',
        'Если нам нужно сделать быстро сайт, ты такой: «Да, конечно, без проблем, сделаю». Нужно сделать какую-нибудь там обложку, либо еще там что-то: «Да, конечно, без проблем». То есть ты такой человек, который безотказный, достаточно быстро работаешь, да и за адекватный прайс по рынку.',
        'Так что спасибо то, что ты есть. Спасибо то, что ты как личность, как человек крутой, просто потому что... я работал с очень многими специалистами, в том числе с дизайнерами, но с тобой максимально комфортно, ты очень человечный. Вот. И всегда делаешь все очень круто, качественно. Твои дизайны одни из самых лучших дизайнов. Поэтому тебе большое спасибо. Ребята, советую работать с Яковом.',
      ],
    },
  },
  {
    id: 'compass',
    author: 'Сайёра Аюпова',
    role: 'Управляющий партнер',
    company: 'Compass',
    avatar: '/reviews/sayora-ayupova.webp',
    projectTitle: 'Compass',
    projectUrl: '/case/compass',
    projectImage: '/case/compass.webp',
    quote:
      'Проектом довольна и хочу продолжать сотрудничество! Яша предложил современный дизайн в точном соответствии с брифом. Понравилась четкая техническая работа, отработка комментариев и конструктивная коммуникация. Разработка сайта и визиток прошла комфортно. Были заминки со сроками и начальным SEO, но итоговый результат перекрыл эти нюансы. Спасибо за работу!',
    fullReview: {
      lead: 'В целом проектом и работой довольна и хотела бы продолжать сотрудничество',
      sections: [
        {
          title: 'Что понравилось?',
          items: [
            'Работа по технической части сайта: процесс дизайна в Тильде, точная коррекция в соответствии с комментариями, поиск решений (например выравнивание строк)',
            'Предложенный дизайн сайта в соответствии с брифом',
            'Короткий и качественный процесс брифинга и обмена оборотной связью, подбор фотографий и современных решений в дизайне',
            'Адекватные комментарии и объяснения по дизайну и техработе сайта на вопросы от клиента',
            'Работа по шаблонам и визиткам была очень комфортная для меня',
          ],
        },
        {
          title: 'Что очень понравилось?',
          items: [
            'Данное предложение по обратной связи на проект 👍🏻',
            'Конструктивная коммуникация с вами, Яков 🤝🙌',
          ],
        },
        {
          title: 'Что напрягало?',
          items: [
            'Некачественная работа по SEO вначале, чувствовался outsourcing и нехватка внутренних компетенций в данном вопросе. Была проделана коррекция после нескольких итераций, но неудовлетворительно.',
            'Предложенный копирайт несмотря на то, что в брифе обговаривали копирайт от клиента. Также копирайт не соответствовал профессиональному контенту необходимого для данного сайта.',
            'С обоих сторон были задержки с реакцией на обратную связь, из-за чего затянулся проект. Возможно нужно более реалистично согласовывать сроки на коррекции и проверки и закладывать в проект.',
          ],
        },
      ],
    },
  },
  {
    id: 'shanding',
    author: 'Александр Кугуенко',
    role: 'CEO',
    company: 'Shanding Partners',
    avatar: '/reviews/shanding.webp',
    projectTitle: 'Shanding',
    projectUrl: '/case/shanding',
    projectImage: '/case/shanding.webp',
    quote:
      'Сотрудничали по созданию лендинга и разработке POS-материалов. Главный показатель профессионализма для нас, что макеты не потребовали правок и сразу ушли в печать. Результатом довольны на сто процентов. Периодически обращаемся к Якову, когда появляются новые задачи.',
  },
];

export const reviewsDataEn: ReviewItem[] = [
  {
    id: 'rv',
    author: 'Roman Rykunov',
    role: 'Producer',
    company: 'Rykunov & Kudryashov',
    avatar: '/reviews/roman-rykunov.webp',
    projectTitle: 'Rykunov & Kudryashov',
    projectUrl: '/case/rv',
    projectImage: '/case/rv.webp',
    quote:
      'I have been collaborating with Yakov since 2020. Over this time, we have delivered a massive volume of work and launched numerous websites. He works fast, delivers top quality, and is always ready to step in under tight deadlines. Yakov is not only a great professional but also a pleasure to work with. His visual solutions are truly top-tier. Highly recommended!',
    fullReview: {
      lead: 'Hello everyone. Yakov, hello! Wanted to leave a review of working with you, as I am one of your longest-standing clients, working together since early 2020.',
      paragraphs: [
        'Over these years we have done tremendous work together. We built so many websites, and I just want to say a heartfelt thank you because you always step in and deliver.',
        'Whenever we need a fast turnaround on a website, deck, or visual asset, you say: "Sure, no problem, consider it done." Responsive, fast, and at a very fair market rate.',
        'Working with you is seamless and human. Your design solutions are consistently among the highest level. Thank you for your partnership!',
      ],
    },
  },
  {
    id: 'compass',
    author: 'Sayora Ayupova',
    role: 'Managing Partner',
    company: 'Compass',
    avatar: '/reviews/sayora-ayupova.webp',
    projectTitle: 'Compass',
    projectUrl: '/case/compass',
    projectImage: '/case/compass.webp',
    quote:
      'Very pleased with the project and looking forward to ongoing collaboration! Yakov proposed a modern design fully aligned with our brief. I appreciated the precise technical execution, quick responses to feedback, and constructive communication. The website and business card development went smoothly. Thank you for great work!',
    fullReview: {
      lead: 'Overall, very pleased with the project and would love to continue collaborating.',
      sections: [
        {
          title: 'What we liked:',
          items: [
            'Technical precision and execution on the website, accurate adjustments according to feedback',
            'Proposed website design fully aligned with our brief',
            'Concise briefing, fast feedback loops, great curation of typography and photos',
            'Constructive communication and clear design rationale',
          ],
        },
      ],
    },
  },
  {
    id: 'shanding',
    author: 'Alexander Kuguyenko',
    role: 'CEO',
    company: 'Shanding Partners',
    avatar: '/reviews/shanding.webp',
    projectTitle: 'Shanding',
    projectUrl: '/case/shanding',
    projectImage: '/case/shanding.webp',
    quote:
      'We collaborated on landing page development and POS materials. The clearest sign of professionalism was that the layouts required zero revisions and went straight to print production. 100% satisfied with the outcome. We consistently turn to Yakov whenever new design challenges arise.',
  },
];

