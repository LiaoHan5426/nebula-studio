import vue from '@vitejs/plugin-vue';
import type { PluginOption } from 'vite';

export function nebulaVue(): PluginOption {
  return vue();
}
