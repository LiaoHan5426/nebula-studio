import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/app-shell';
import { nebulaEmbedBootEntries } from 'virtual:nebula-app-manifest';

document.documentElement.dataset.platform = 'web';

const embedLoaders = import.meta.glob('./embed/*-entry.ts');

void (async (): Promise<void> => {
  const surface = new URLSearchParams(location.search).get(
    WEB_SHELL_EMBED_QUERY,
  );

  if (surface && surface in nebulaEmbedBootEntries) {
    const entry = nebulaEmbedBootEntries[surface];
    const sourceEntry = entry?.replace(/\.js$/, '.ts');
    const loader = sourceEntry ? embedLoaders[sourceEntry] : undefined;
    if (!loader) {
      throw new Error(
        `[web-boot] Missing embed loader for surface "${surface}"`,
      );
    }
    await loader();
    return;
  }

  await import('./shell-entry.js');
})();
