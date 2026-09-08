import {defineField, defineType} from 'sanity'

export const caseType = defineType({
  name: 'case',
  title: 'Кейс',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Название',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Год',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Краткое описание',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'services',
      title: 'Услуги',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'cover',
      title: 'Обложка (URL)',
      type: 'url',
      description:
        'Готовая ссылка на media.yapil.art. Файл нужно заранее сжать через Tinify и загрузить в Cloudflare R2 — сюда вставляется только итоговый https://media.yapil.art/... URL (картинка или .mp4/.webm для видео-обложки).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'В подборке (featured)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'task',
      title: 'Задача',
      type: 'text',
    }),
    defineField({
      name: 'goal',
      title: 'Цель',
      type: 'text',
    }),
    defineField({
      name: 'link',
      title: 'Ссылка на проект',
      type: 'url',
    }),
    defineField({
      name: 'reviewed',
      title: 'Проверено',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'body',
      title: 'Тело кейса (Markdown/HTML)',
      type: 'text',
      rows: 20,
      description:
        'Markdown с поддержкой сырых HTML-блоков сайта (media-grid, pdf-slider, video-container) — как в исходных .md файлах. Рендерится как есть, без визуального редактора.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'summary'},
  },
})
