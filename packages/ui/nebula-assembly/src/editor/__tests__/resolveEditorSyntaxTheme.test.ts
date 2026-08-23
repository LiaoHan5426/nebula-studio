import { describe, expect, it } from 'vitest';

import { resolveEditorSyntaxTheme } from '../resolveEditorSyntaxTheme.ts';

describe('resolveEditorSyntaxTheme', () => {
  it('maps light/dark to Monaco palettes without using accent', () => {
    expect(resolveEditorSyntaxTheme('light')).toBe('vs');
    expect(resolveEditorSyntaxTheme('dark')).toBe('vs-dark');
  });
});
