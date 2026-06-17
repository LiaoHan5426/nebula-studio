import '@nebula-studio-internal/tailwind/electron';
import { installWebPresentation } from '@nebula-studio/app-shell';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import App from '@nebula-studio-renderer/integration/app';
import { bootstrapAuthFromShell } from '@nebula-studio-renderer/integration/bootstrap-auth';
import router from '@nebula-studio-renderer/integration/router';

installWebPresentation({
  scope: 'web-embed-integration',
  processVersions: {
    node: __NEBULA_BUILD_NODE_VERSION__,
  },
});

async function mountIntegrationApp(): Promise<void> {
  await bootstrapAuthFromShell();

  const app = createApp({
    render: () =>
      h(
        ConfigProvider,
        { manageDom: true },
        {
          default: () => h(App),
        },
      ),
  }).use(router);

  const initial = router.resolve(window.location.pathname);
  if (initial.matched.length === 0) {
    await router.replace('/subscriptions');
  }

  app.mount('#app');
}

void mountIntegrationApp();
