import type { UserConfig } from 'vite';

/** 与 NebulaReader / 文档站一致：避免多份 highlight.js 导致 fence 高亮异常 */
export const nebulaRendererResolve: UserConfig['resolve'] = {
  dedupe: ['highlight.js', 'vue'],
};
