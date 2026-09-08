import {defineField, defineType} from 'sanity'

export const vsyachinaItemType = defineType({
  name: 'vsyachinaItem',
  title: 'Всячина',
  type: 'document',
  fields: [
    defineField({
      name: 'fileName',
      title: 'Имя файла (для группировки)',
      type: 'string',
      description:
        'Оригинальное имя файла с расширением, например "2gippo1.webp" — используется на сайте для группировки элементов по бренду.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Название',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt-текст',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Файл (URL)',
      type: 'url',
      description:
        'Готовая ссылка на media.yapil.art. Файл нужно заранее сжать через Tinify и загрузить в Cloudflare R2 — сюда вставляется только итоговый https://media.yapil.art/... URL.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'width',
      title: 'Ширина (px)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'height',
      title: 'Высота (px)',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isVideo',
      title: 'Это видео',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Порядок',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'fileName'},
  },
})
