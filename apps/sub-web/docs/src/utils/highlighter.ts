import type { Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * 获取 Shiki 高亮器实例（真正的模块级单例）。
 * 所有 Demo 组件共享同一个实例。
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = import('shiki').then(({ createHighlighter }) =>
    createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'typescript',
        'javascript',
        'vue',
        'html',
        'css',
        'json',
        'markdown',
        'bash',
        'shell',
      ],
    }),
  );

  highlighter = await highlighterPromise;
  return highlighter;
}
