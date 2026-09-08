import {defineField, defineType} from 'sanity'

export const homepageType = defineType({
  name: 'homepage',
  title: 'Главная страница',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Заголовок',
          type: 'string',
          description: 'Поддерживает <br /> для ручного переноса строки, как сейчас в коде.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'description',
          title: 'Подзаголовок',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'ctaText',
          title: 'Текст кнопки',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'aboutCards',
      title: 'Карточки «О студии»',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Заголовок',
              type: 'string',
              description: 'Поддерживает <br /> для ручного переноса строки.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Текст',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Иконка',
              type: 'string',
              options: {
                list: [
                  {title: 'Award', value: 'award'},
                  {title: 'Refresh', value: 'refresh-cw'},
                  {title: 'Briefcase', value: 'briefcase'},
                  {title: 'Shapes', value: 'shapes'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'icon'},
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'founderBio',
      title: 'Текст об основателе (Founder)',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Главная страница'}
    },
  },
})
