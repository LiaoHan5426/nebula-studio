import type { UserConfig } from 'vite';

export const nebulaRendererOptimizeDeps: UserConfig['optimizeDeps'] = {
  include: ['highlight.js/lib/common', 'marked'],
};
