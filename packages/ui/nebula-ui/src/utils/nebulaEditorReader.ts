import type {
  NebulaEditorCodeLanguage,
  NebulaEditorVariant,
} from '../components/editor/types';

/** `NebulaReader` 如何解释 `source` 字符串（与 `NebulaEditor` 产出对齐） */
export type NebulaReaderFormat = 'markdown' | 'html' | 'plain';

export type NebulaEditorReaderBinding = {
  source: string;
  format: NebulaReaderFormat;
};

/**
 * 根据 `NebulaEditor` 的 `variant` / `codeLanguage` 决定预览格式：
 * - `richtext` → `html`（wangEditor）
 * - `code` + `markdown` → `markdown`
 * - 其它代码语言 → `plain`（转义后置于 `<pre>`）
 */
export function resolveReaderFormat(opts: {
  variant: NebulaEditorVariant;
  codeLanguage?: NebulaEditorCodeLanguage;
}): NebulaReaderFormat {
  if (opts.variant === 'richtext') return 'html';
  if (opts.codeLanguage === 'markdown') return 'markdown';
  return 'plain';
}

/** `v-model` + 编辑器形态 → 直接绑定到 `<NebulaReader :source :format />` */
export function bindingFromNebulaEditor(
  modelValue: string,
  opts: {
    variant: NebulaEditorVariant;
    codeLanguage?: NebulaEditorCodeLanguage;
  },
): NebulaEditorReaderBinding {
  const format = resolveReaderFormat(opts);
  const source =
    format === 'html'
      ? prepareRichTextHtmlForReader(modelValue)
      : (modelValue ?? '');
  return { source, format };
}

/**
 * wangEditor 等产出的 HTML → 预览用字符串。
 * 默认做最小清理（去掉 `<script>`），不信任外链脚本；复杂场景请在业务层接入 DOMPurify。
 */
export function prepareRichTextHtmlForReader(html: string): string {
  const raw = html ?? '';
  return stripScriptTags(raw);
}

function stripScriptTags(html: string): string {
  return html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );
}
