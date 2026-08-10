import type { ComputedRef, InjectionKey, Ref } from 'vue';

import type { UseRendererLocaleSyncOptions } from './useRendererLocaleSync.ts';
import type { UseRendererThemeSyncOptions } from './useRendererThemeSync.ts';

import { computed, defineComponent, h, provide } from 'vue';

import { useRendererLocaleSync } from './useRendererLocaleSync.ts';
import { useRendererThemeSync } from './useRendererThemeSync.ts';

type ThemeMode = 'dark' | 'light';
type AppMode = 'build' | 'dev';

export interface RendererConfigContext {
  appMode: ReturnType<typeof useRendererThemeSync>['appMode'];
  isDark: ReturnType<typeof useRendererThemeSync>['isDark'];
  locale: Ref<string>;
  refreshAppMode: () => Promise<AppMode>;
  setLocale: (next: string) => Promise<string>;
  setTheme: (next: ThemeMode) => Promise<ThemeMode>;
  theme: ReturnType<typeof useRendererThemeSync>['theme'];
  /** shadcn-vue 兼容的主题类名 ('dark' | '') */
  themeClass: ComputedRef<string>;
  toggleTheme: () => Promise<ThemeMode>;
}

export const rendererConfigKey: InjectionKey<RendererConfigContext> =
  Symbol('renderer-config');

export const ConfigProvider = defineComponent({
  name: 'ConfigProvider',
  props: {
    manageDom: {
      type: Boolean,
      default: false,
    },
    /** BCP 47 or app-specific locale id; should match main-process default. */
    fallbackLocale: {
      type: String,
      default: 'zh-CN',
    },
  },
  setup(props, { slots }) {
    const themeState = useRendererThemeSync({
      manageDom: props.manageDom,
    } satisfies UseRendererThemeSyncOptions);
    const localeState = useRendererLocaleSync({
      manageDom: props.manageDom,
      fallbackLocale: props.fallbackLocale,
    } satisfies UseRendererLocaleSyncOptions);
    const state: RendererConfigContext = {
      ...themeState,
      ...localeState,
      themeClass: computed(() => (themeState.isDark.value ? 'dark' : '')),
    };
    provide(rendererConfigKey, state);
    return () => h('div', slots.default?.() ?? []);
  },
});
