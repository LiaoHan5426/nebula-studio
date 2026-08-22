import type { UserConfig } from 'vite';

export const nebulaRendererOptimizeDeps: UserConfig['optimizeDeps'] = {
  // UMD package; Vite must prebundle it to ESM or `import Draggable from 'vuedraggable'` fails.
  include: ['vuedraggable'],
  holdUntilCrawlEnd: true,
};
