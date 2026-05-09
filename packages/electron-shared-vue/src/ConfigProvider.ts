import { defineComponent, h, provide } from 'vue';
import type { InjectionKey, Ref } from 'vue';
import { useRendererLocaleSync } from './useRendererLocaleSync';
import type { UseRendererLocaleSyncOptions } from './useRendererLocaleSync';
import { useRendererThemeSync } from './useRendererThemeSync';
import type { UseRendererThemeSyncOptions } from './useRendererThemeSync';

type ThemeMode = 'light' | 'dark';
type AppMode = 'dev' | 'build';

export interface RendererConfigContext {
  theme: ReturnType<typeof useRendererThemeSync>['theme'];
  appMode: ReturnType<typeof useRendererThemeSync>['appMode'];
  isDark: ReturnType<typeof useRendererThemeSync>['isDark'];
  setTheme: (next: ThemeMode) => Promise<ThemeMode>;
  toggleTheme: () => Promise<ThemeMode>;
  refreshAppMode: () => Promise<AppMode>;
  locale: Ref<string>;
  setLocale: (next: string) => Promise<string>;
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
    };
    provide(rendererConfigKey, state);
    return () => h('div', slots.default?.() ?? []);
  },
});
