/** CodeMirror 语言约定（vue 使用 HTML 高亮近似 .vue SFC） */
export type NebulaEditorCodeLanguage =
  | 'markdown'
  | 'vue'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'python';

/** `NebulaEditor` 语言切换下拉里使用 */
export const NEBULA_EDITOR_CODE_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: NebulaEditorCodeLanguage;
  label: string;
}> = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'vue', label: 'Vue' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
];

/** `NebulaMarkdownPane`：仅编辑 / 仅预览 / 分栏 */
export type NebulaMarkdownPaneMode = 'split' | 'edit' | 'preview';

/** `richtext`：wangEditor HTML；`.docx`/`.xlsx` 为二进制，需在业务层用 mammoth、SheetJS 等解析后再传入编辑器 */
export type NebulaEditorVariant = 'code' | 'richtext';
