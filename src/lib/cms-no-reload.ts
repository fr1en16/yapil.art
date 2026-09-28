// Saving in the CMS rewrites content files, which makes the dev server full-reload every open page.
// Throwing from this handler makes Vite skip the reload so the admin keeps its state.
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', () => {
    throw new Error('CMS: full reload skipped');
  });
}
