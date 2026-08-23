import type { EditorSyntaxTheme, EditorTheme } from '../types/editor';

/** Monaco/VS Code syntax palettes — never derived from product accent. */
export function resolveEditorSyntaxTheme(
  theme: EditorTheme,
): EditorSyntaxTheme {
  return theme === 'dark' ? 'vs-dark' : 'vs';
}
