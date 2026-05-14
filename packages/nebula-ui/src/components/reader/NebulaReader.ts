import { Marked } from 'marked';
import { computed, defineComponent, h } from 'vue';
import type { NebulaEditorCodeLanguage } from '../editor-types/NebulaEditorTypes';
import {
  highlightFenceCodeAsHtml,
  highlightSourceAsHtml,
} from '../../utils/highlightNebula';
import type { NebulaReaderFormat } from '../../utils/nebulaEditorReader';
import { cn } from '../../utils/cn';

/** v-html 中代码块必须转义，否则 `<template>` 等会被当成真实标签解析 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createMarked(): Marked {
  const markdown = new Marked();
  markdown.use({
    renderer: {
      code(token) {
        const language =
          (token.lang?.trim() || 'text').replace(/[^a-z0-9+-]/gi, '') || 'text';
        const rawCode = token.text ?? '';
        const safeLangLabel = escapeHtml(token.lang?.trim() || 'text');
        const encoded = encodeURIComponent(rawCode);
        const key = `${language}:${rawCode.length}:${rawCode.slice(0, 20)}`;
        const hl = highlightFenceCodeAsHtml(rawCode, token.lang?.trim() ?? '');
        const inner = hl ?? escapeHtml(rawCode);
        const codeClass = hl
          ? `hljs language-${language}`
          : `language-${language}`;
        return `<div class="code-block"><div class="code-block__toolbar"><span class="code-block__lang">${safeLangLabel}</span><button type="button" class="code-block__copy" data-copy="${encoded}" data-key="${escapeHtml(key)}">Copy</button></div><pre><code class="${codeClass}">${inner}</code></pre></div>`;
      },
    },
  });
  return markdown;
}

/**
 * **`NebulaEditor` 专用预览**：根据 `format` 渲染 `source`。
 * - `markdown`：marked（GFM）； fenced 代码块使用 highlight.js 高亮（与编辑器语言一致体验）
 * - `html`：`variant="richtext"` / wangEditor 等 HTML
 * - `plain`：代码文本；设置 **`plainHighlightLanguage`** 时使用 highlight.js，否则仅转义
 *
 * 与 `bindingFromNebulaEditor` 的 variant / codeLanguage 约定一致。
 */
export const NebulaReader = defineComponent({
  name: 'NebulaReader',
  props: {
    /** 与 `NebulaEditor` `v-model` 同源字符串 */
    source: {
      type: String,
      default: '',
    },
    /** 如何解释 `source`；默认 `markdown` 兼容旧用法 */
    format: {
      type: String as () => NebulaReaderFormat,
      default: 'markdown',
    },
    /** `format="plain"` 时：与左侧 `v-model:code-language` 同步以启用预览语法高亮 */
    plainHighlightLanguage: {
      type: String as () => NebulaEditorCodeLanguage | undefined,
      default: undefined,
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const markdown = createMarked();

    const rendered = computed(() => {
      const src = props.source ?? '';
      switch (props.format) {
        case 'html':
          return src;
        case 'plain': {
          const lang = props.plainHighlightLanguage;
          if (lang) {
            const inner = highlightSourceAsHtml(src, lang);
            return `<pre class="nebula-reader__plain"><code class="hljs">${inner}</code></pre>`;
          }
          return `<pre class="nebula-reader__plain"><code>${escapeHtml(src)}</code></pre>`;
        }
        default:
          return markdown.parse(src) as string;
      }
    });

    const rootClass = computed(() =>
      cn(
        'nebula-reader',
        props.format === 'markdown' ? 'nebula-markdown' : null,
        props.format === 'html' ? 'nebula-reader--html' : null,
        props.format === 'plain' ? 'nebula-reader--plain' : null,
        props.class,
      ),
    );

    const onClick = async (event: MouseEvent): Promise<void> => {
      if (props.format !== 'markdown') return;

      const target = event.target as HTMLElement | null;
      const button = target?.closest(
        '.code-block__copy',
      ) as HTMLButtonElement | null;
      if (!button) return;

      const encoded = button.dataset.copy;
      const key = button.dataset.key;
      if (!encoded || !key) return;

      const text = decodeURIComponent(encoded);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      button.textContent = 'Copied';
      window.setTimeout(() => {
        if (button.dataset.key === key) button.textContent = 'Copy';
      }, 1200);
    };

    return () =>
      h('div', {
        class: rootClass.value,
        innerHTML: rendered.value,
        onClick,
      });
  },
});
