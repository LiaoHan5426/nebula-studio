import type { UserConfig } from 'vite';

/** Renderer workspaces must share a single Vue runtime. */
export const nebulaRendererResolve: UserConfig['resolve'] = {
  dedupe: ['vue'],
};
