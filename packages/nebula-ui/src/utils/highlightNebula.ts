/**
 * 使用 `highlight.js/lib/common`（官方预注册若干语言）而非仅 `lib/core` + 分散 register。
 * 仅 `core` 时，Vite 摇树/分包可能导致 `registerLanguage` 未随运行时代码执行，围栏高亮在浏览器中恒为回退转义。
 */
import hljs from 'highlight.js/lib/common';
import xml from 'highlight.js/lib/languages/xml';

import type { NebulaEditorCodeLanguage } from '../components/NebulaEditorTypes';

/** Vue SFC：与 xml 相同；供围栏 ` ```vue ` 与编辑器 `codeLanguage: vue` */
hljs.registerLanguage('vue', xml);

/** Nebula `codeLanguage` → highlight.js 语言 id */
export function hljsLanguageFromEditorLanguage(
  lang: NebulaEditorCodeLanguage,
): string {
  switch (lang) {
    case 'vue':
      return 'vue';
    default:
      return lang;
  }
}

/**
 * 将 fence / 编辑器语言标签规范为 highlight.js 注册的名称。
 */
export function normalizeFenceLangForHljs(raw: string): string | undefined {
  const s = raw.trim().toLowerCase();
  if (!s || s === 'text' || s === 'txt' || s === 'plain') return undefined;

  const alias: Record<string, string> = {
    vue: 'vue',
    md: 'markdown',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
  };

  const mapped = alias[s] ?? s;
  if (hljs.getLanguage(mapped)) return mapped;

  return hljs.getLanguage(s) ? s : undefined;
}

/**
 * 返回已转义为 HTML 的高亮片段（仅内部 markup，无外层 `<pre>`）。
 */
export function highlightSourceAsHtml(
  source: string,
  lang: NebulaEditorCodeLanguage,
): string {
  const id = hljsLanguageFromEditorLanguage(lang);
  try {
    return hljs.highlight(source, { language: id, ignoreIllegals: true }).value;
  } catch {
    return escapeHtmlMinimal(source);
  }
}

/**
 * 按 markdown fence 语言字符串高亮（未识别语言则返回 undefined，由调用方回退为纯转义）。
 */
export function highlightFenceCodeAsHtml(
  source: string,
  fenceLang: string,
): string | undefined {
  let id = normalizeFenceLangForHljs(fenceLang);
  if (!id) {
    const s = fenceLang.trim().toLowerCase();
    if (s === 'vue' || s === 'html' || s === 'htm') id = 'xml';
  }
  if (!id) {
    if (import.meta.env.DEV) {
      console.warn(
        '[nebula-ui] highlightFence: unsupported fence lang (falling back to escaped text)',
        fenceLang,
      );
    }
    return undefined;
  }
  try {
    return hljs.highlight(source, { language: id, ignoreIllegals: true }).value;
  } catch (primary) {
    if (id !== 'xml') {
      try {
        return hljs.highlight(source, { language: 'xml', ignoreIllegals: true })
          .value;
      } catch (fallback) {
        if (import.meta.env.DEV) {
          console.warn('[nebula-ui] highlightFence: highlight failed', {
            fenceLang,
            id,
            primary,
            fallback,
          });
        }
        return undefined;
      }
    }
    if (import.meta.env.DEV) {
      console.warn('[nebula-ui] highlightFence: highlight failed', {
        fenceLang,
        id,
        primary,
      });
    }
    return undefined;
  }
}

function escapeHtmlMinimal(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
