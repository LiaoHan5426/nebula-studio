/**
 * Markdown 渲染工具。
 *
 * 使用 markdown-it 解析 Markdown，Shiki 进行代码高亮。
 */
import MarkdownIt from 'markdown-it';
import type { Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * 获取 Shiki 高亮器实例（懒加载单例）。
 */
async function getHighlighter(): Promise<Highlighter> {
  if (highlighter) return highlighter;
  if (highlighterPromise) return highlighterPromise;

  highlighterPromise = import('shiki').then((shiki) =>
    shiki.createHighlighter({
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

/**
 * 创建 markdown-it 实例（同步，不含代码高亮）。
 * 用于 Vite 插件的构建时转换（高亮在客户端异步完成）。
 */
export function createMarkdownRenderer(): MarkdownIt {
  return MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });
}

/**
 * 创建带 Shiki 代码高亮的 markdown-it 实例。
 */
export async function createMarkdownRendererWithHighlight(): Promise<MarkdownIt> {
  const h = await getHighlighter();

  const md = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(code: string, lang: string): string {
      if (lang && h.getLoadedLanguages().includes(lang)) {
        return h.codeToHtml(code, {
          lang,
          theme: 'github-dark',
        });
      }
      return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
    },
  });

  return md;
}

/**
 * 解析 Markdown frontmatter（简易实现）。
 *
 * @returns frontmatter 对象与去除 frontmatter 后的正文内容
 */
export function parseFrontmatter(raw: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = raw.match(fmRegex);

  if (!match) {
    return { data: {}, content: raw };
  }

  const fmBlock = match[1] ?? '';
  const content = raw.slice(match[0].length);
  const data: Record<string, unknown> = {};

  for (const line of fmBlock.split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key) {
      data[key] = value;
    }
  }

  return { data, content };
}

/**
 * 将 Markdown 字符串渲染为 HTML 字符串（含代码高亮）。
 */
export async function renderMarkdown(raw: string): Promise<string> {
  const { content } = parseFrontmatter(raw);
  const md = await createMarkdownRendererWithHighlight();
  return md.render(content);
}
