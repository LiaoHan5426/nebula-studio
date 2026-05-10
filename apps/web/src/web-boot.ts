import { WEB_SHELL_EMBED_QUERY } from '@nebula-studio/app-shell';

const surface = new URLSearchParams(location.search).get(WEB_SHELL_EMBED_QUERY);

if (surface === 'docs') {
  await import('./embed/docs-entry.ts');
} else if (surface === 'settings') {
  await import('./embed/settings-entry.ts');
} else if (surface === 'login') {
  await import('./embed/login-entry.ts');
} else {
  await import('./shell-entry.ts');
}
