import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/app-shell';
import { nebulaEmbedBootEntries } from 'virtual:nebula-app-manifest';

const embedLoaders: Record<
  keyof typeof nebulaEmbedBootEntries,
  () => Promise<unknown>
> = {
  settings: () => import('./embed/settings-entry.js'),
  login: () => import('./embed/login-entry.js'),
  docs: () => import('./embed/docs-entry.js'),
  integration: () => import('./embed/integration-entry.js'),
};

void (async (): Promise<void> => {
  const surface = new URLSearchParams(location.search).get(
    WEB_SHELL_EMBED_QUERY,
  );

  if (surface && surface in nebulaEmbedBootEntries) {
    const loader = embedLoaders[surface as keyof typeof nebulaEmbedBootEntries];
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
