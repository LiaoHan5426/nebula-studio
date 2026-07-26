import type { CodeEditorOptions } from './types';

export const DEFAULT_CODE_EDITOR_OPTIONS: Readonly<
  Required<CodeEditorOptions>
> = {
  fontSize: 14,
  tabSize: 2,
  minimap: false,
  lineNumbers: true,
  wordWrap: 'off',
  automaticLayout: true,
};

export function normalizeCodeEditorOptions(
  options: CodeEditorOptions = {},
): Required<CodeEditorOptions> {
  return {
    ...DEFAULT_CODE_EDITOR_OPTIONS,
    ...options,
    fontSize: Math.max(10, Math.min(options.fontSize ?? 14, 40)),
    tabSize: Math.max(1, Math.min(options.tabSize ?? 2, 8)),
  };
}
