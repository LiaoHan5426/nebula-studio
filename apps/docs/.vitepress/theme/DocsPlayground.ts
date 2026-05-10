import { ConfigProvider } from '@nebula-studio-electron/electron-shared-vue';
import {
  defineAsyncComponent,
  defineComponent,
  h,
  onMounted,
  ref,
} from 'vue';
import { installWebStubs } from '../../src/runtime/installWebStubs';

/** 纯 TS + render，避免与 `apps/docs` 内 Vite 8 并存时 `.vue` 在 VitePress 管道中空载的问题 */
export default defineComponent({
  name: 'DocsPlayground',
  setup() {
    const App = defineAsyncComponent({
      loader: () => import('../../src/App.vue'),
      ...({ ssr: false } as object),
    });
    const ready = ref(false);

    onMounted(() => {
      installWebStubs({
        scope: 'web',
        theme: {
          storageKey: 'nebula-docs-theme',
          default: 'dark',
        },
        locale: {
          storageKey: 'nebula-docs-locale',
          default: 'zh-CN',
        },
        processVersions: {
          node:
            typeof __NEBULA_BUILD_NODE_VERSION__ !== 'undefined'
              ? __NEBULA_BUILD_NODE_VERSION__
              : '',
        },
      });
      ready.value = true;
    });

    return () =>
      ready.value
        ? h(
            ConfigProvider,
            { manageDom: true },
            {
              default: () => h(App),
            },
          )
        : h(
            'p',
            {
              class: 'docs-vp-fallback',
              style:
                'padding:1rem;color:hsl(var(--muted-foreground, 0 0% 45%));',
            },
            '加载交互示例中…',
          );
  },
});
