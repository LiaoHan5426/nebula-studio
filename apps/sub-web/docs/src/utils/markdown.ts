/**
 * Markdown 渲染工具。
 *
 * 使用 markdown-it 解析 Markdown，Shiki 进行代码高亮。
 */
import MarkdownIt from 'markdown-it';
import { getHighlighter } from './highlighter';

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
