import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/app-shell';

void (async (): Promise<void> => {
  const surface = new URLSearchParams(location.search).get(
    WEB_SHELL_EMBED_QUERY,
  );

  /** 单 `index.html` + `embed`：与 settings 相同，各子应用在同一 dev server 内按需挂载 */
  if (surface === 'settings') {
    await import('./embed/settings-entry.js');
    return;
  }
  if (surface === 'login') {
    await import('./embed/login-entry.js');
    return;
  }
  if (surface === 'docs') {
    await import('./embed/docs-entry.js');
    return;
  }
  if (surface === 'integration') {
    await import('./embed/integration-entry.js');
    return;
  }
  await import('./shell-entry.js');
})();
