import {defineField, defineType} from 'sanity'

const slugFieldDescription =
  'Не переименовывать без синхронной правки src/data/geoServicesData.ts и SERVICE_SLUGS в src/data/seoPolicy.mjs — они завязаны на этот slug по строке, а не по ссылке.'

export const serviceType = defineType({
  name: 'service',
  title: 'Услуга',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      description: slugFieldDescription,
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'order', title: 'Порядок', type: 'number', validation: (Rule) => Rule.required()}),
    defineField({name: 'number', title: 'Номер (бейдж, напр. "01")', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'name', title: 'Название', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'tag', title: 'Тег', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'heroH1', title: 'Hero: H1', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'heroLead', title: 'Hero: подзаголовок', type: 'text', rows: 3, validation: (Rule) => Rule.required()}),
    defineField({
      name: 'metrics',
      title: 'Метрики',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'number', title: 'Число', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'label', title: 'Подпись', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Текст', type: 'string', validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({name: 'formatsTitle', title: 'Заголовок блока «Форматы»', type: 'string'}),
    defineField({
      name: 'formats',
      title: 'Форматы',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'subtitle', title: 'Подзаголовок', type: 'string'}),
            defineField({name: 'description', title: 'Описание', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({name: 'deliverablesTitle', title: 'Заголовок блока «Результаты»', type: 'string'}),
    defineField({
      name: 'deliverables',
      title: 'Результаты (deliverables)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Текст', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({name: 'processTitle', title: 'Заголовок блока «Процесс»', type: 'string'}),
    defineField({
      name: 'steps',
      title: 'Шаги процесса',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'number', title: 'Номер', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'text', title: 'Текст', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({name: 'casesTitle', title: 'Заголовок блока «Кейсы»', type: 'string'}),
    defineField({
      name: 'caseSlugs',
      title: 'Слаги связанных кейсов',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Слаги документов "Кейс" (case) — как в текущем коде, строкой, без Sanity-ссылок.',
    }),
    defineField({name: 'faqTitle', title: 'Заголовок блока FAQ', type: 'string'}),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'question', title: 'Вопрос', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'answer', title: 'Ответ', type: 'text', rows: 3, validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({
      name: 'ctaTitle',
      title: 'CTA: заголовок',
      type: 'string',
      description: 'Поддерживает <br /> для ручного переноса строки.',
    }),
    defineField({name: 'ctaLead', title: 'CTA: текст', type: 'text', rows: 2}),
    defineField({name: 'crossLinksTitle', title: 'Заголовок блока «Другие услуги»', type: 'string'}),
    defineField({
      name: 'crossLinks',
      title: 'Другие услуги (перелинковка)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'slug',
              title: 'Slug услуги',
              type: 'string',
              description: 'Slug другого документа "Услуга" — строкой, без Sanity-ссылки.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'number', title: 'Номер', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'description', title: 'Описание', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'description', title: 'Description', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
        defineField({name: 'h1', title: 'H1', type: 'string', validation: (Rule) => Rule.required()}),
        defineField({name: 'keywords', title: 'Ключевые слова', type: 'array', of: [{type: 'string'}]}),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'slug.current'},
  },
})
