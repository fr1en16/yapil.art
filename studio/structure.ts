import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.listItem()
        .title('Главная страница')
        .id('homepage')
        .child(S.document().schemaType('homepage').documentId('homepage')),
      S.listItem()
        .title('Настройки сайта')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'homepage' && item.getId() !== 'siteSettings',
      ),
    ])
