import {defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Настройки сайта',
  type: 'document',
  fields: [
    defineField({name: 'contactEmail', title: 'Email', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'contactPhone',
      title: 'Телефон (для JSON-LD, формат +7...)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'whatsappPhone',
      title: 'WhatsApp номер (цифры без +, для wa.me/...)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'telegramUsername', title: 'Telegram username (без @)', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'logoUrl', title: 'Лого (URL)', type: 'url', validation: (Rule) => Rule.required()}),
    defineField({name: 'defaultOgImage', title: 'OG-картинка по умолчанию (URL)', type: 'url', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    prepare() {
      return {title: 'Настройки сайта'}
    },
  },
})
