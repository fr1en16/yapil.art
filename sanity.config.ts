import { defineConfig } from 'sanity';
import { structureTool, type StructureResolver } from 'sanity/structure';
import { schemaTypes } from './studio/schemaTypes';

const structure: StructureResolver = (S) =>
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
    ]);

export default defineConfig({
  name: 'yapil',
  title: 'Yapil',
  projectId: 'j2cx2dtx',
  dataset: 'production',
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
});
