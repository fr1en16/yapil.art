import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './studio/schemaTypes';
import { structure } from './studio/structure';

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
