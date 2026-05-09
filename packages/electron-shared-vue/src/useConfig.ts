import { inject } from 'vue';
import { rendererConfigKey } from './ConfigProvider';

export function useConfig() {
  const state = inject(rendererConfigKey, null);
  if (!state) {
    throw new Error('useConfig must be used under <ConfigProvider>.');
  }
  return state;
}
