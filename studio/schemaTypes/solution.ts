import {defineField, defineType} from 'sanity'

export const solutionType = defineType({
  name: 'solution',
  title: 'Решение',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
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
    defineField({name: 'challengesTitle', title: 'Заголовок блока «Задачи»', type: 'string'}),
    defineField({
      name: 'challenges',
      title: 'Задачи (challenges)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Заголовок', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'desc', title: 'Описание', type: 'text', rows: 2, validation: (Rule) => Rule.required()}),
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
