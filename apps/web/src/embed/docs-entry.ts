import '@nebula-studio/nebula-ui/utils/highlightNebula';
import '@nebula-studio-internal/tailwind/electron';
import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import { createApp, h } from 'vue';
import App from '@nebula-studio-renderer/docs/app';
import { installWebStubs } from '@nebula-studio-renderer/docs/install-web-stubs';

installWebStubs({
  scope: 'web',
  /**
   * 与 `shell-entry` 中 `installWebPresentation` 默认一致（`nebula-studio-web-theme` / `nebula-studio-web-locale`），
   * 否则壳顶栏切换只写入壳用 key，iframe 内 docs 仍读旧 key，主题无法同步。
   */
  processVersions: {
    node: __NEBULA_BUILD_NODE_VERSION__,
  },
});

createApp({
  render() {
    return h(
      ConfigProvider,
      { manageDom: true },
      {
        default: () => h(App),
      },
    );
  },
}).mount('#app');
