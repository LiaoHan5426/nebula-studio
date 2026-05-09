import { defineComponent, h, provide } from 'vue';
import type { InjectionKey } from 'vue';
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
  },
  setup(props, { slots }) {
    const state = useRendererThemeSync({
      manageDom: props.manageDom,
    } satisfies UseRendererThemeSyncOptions);
    provide(rendererConfigKey, state);
    return () => h('div', slots.default?.() ?? []);
  },
});
