import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CODE_EDITOR_OPTIONS,
  normalizeCodeEditorOptions,
} from '../options';

describe('normalizeCodeEditorOptions', () => {
  it('provides provider-neutral defaults', () => {
    expect(normalizeCodeEditorOptions()).toEqual(DEFAULT_CODE_EDITOR_OPTIONS);
  });

  it('clamps values that would make the editor unusable', () => {
    expect(
      normalizeCodeEditorOptions({ fontSize: 100, tabSize: 0 }),
    ).toMatchObject({ fontSize: 40, tabSize: 1 });
  });

  it('preserves supported behavior options', () => {
    expect(
      normalizeCodeEditorOptions({
        minimap: true,
        lineNumbers: false,
        wordWrap: 'bounded',
      }),
    ).toMatchObject({
      minimap: true,
      lineNumbers: false,
      wordWrap: 'bounded',
    });
  });
});
