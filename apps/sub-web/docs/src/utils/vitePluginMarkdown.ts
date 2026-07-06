/**
 * Vite 插件：将 Markdown 文件转换为 Vue 组件模块。
 *
 * 支持 frontmatter 解析和 Shiki 代码高亮（客户端异步）。
 */
import type { Plugin } from 'vite';
import fs from 'node:fs';
import { createMarkdownRenderer, parseFrontmatter } from './markdown.ts';

export interface VitePluginMarkdownOptions {
  /**
   * Markdown 文件匹配模式。
   * @default /\.md$/
   */
  include?: RegExp;
}

/**
 * 创建 Vite Markdown 插件。
 *
 * 将 `.md` 文件转换为导出 Vue 组件的 JS 模块。
 */
export function vitePluginMarkdown(
  options: VitePluginMarkdownOptions = {},
): Plugin {
  const { include = /\.md$/ } = options;
  const md = createMarkdownRenderer();

  return {
    name: 'vite-plugin-markdown',
    enforce: 'pre',

    load(id) {
      if (!include.test(id)) return null;
      if (!fs.existsSync(id)) return null;
      // 读取文件内容（transform 钩子会进一步处理）
      return fs.readFileSync(id, 'utf-8');
    },

    transform(_code, id) {
      if (!include.test(id)) return null;
      if (!fs.existsSync(id)) return null;

      const raw = fs.readFileSync(id, 'utf-8');
      const { data, content } = parseFrontmatter(raw);
      const html = md.render(content);
      const htmlStr = JSON.stringify(html);
      const fmStr = JSON.stringify(data);
      const rawStr = JSON.stringify(raw);

      // 生成纯 JS 模块，使用渲染函数避免需要 Vue 模板编译器
      const code = [
        `import { ref, onMounted, defineComponent, h } from 'vue';`,
        ``,
        `export const frontmatter = ${fmStr};`,
        `export const initialHtml = ${htmlStr};`,
        ``,
        `export default defineComponent({`,
        `  name: 'MarkdownPage',`,
        `  setup() {`,
        `    const renderedHtml = ref(${htmlStr});`,
        `    onMounted(async () => {`,
        `      try {`,
        `        const { renderMarkdown } = await import('@/utils/markdown');`,
        `        renderedHtml.value = await renderMarkdown(${rawStr});`,
        `      } catch (e) {`,
        `        console.error('Markdown render failed:', e);`,
        `      }`,
        `    });`,
        `    return () => h('div', {`,
        `      class: 'markdown-body',`,
        `      innerHTML: renderedHtml.value,`,
        `    });`,
        `  },`,
        `});`,
      ].join('\n');

      return { code, map: null };
    },
  };
}
