import type { LowCodeDraftDocument } from '@nebula-studio/low-code-contract';

import { reactive } from 'vue';

import { createDemoBoardSnapshot } from '@nebula-studio/low-code-contract';

import { describe, expect, it } from 'vitest';

import { cloneDraft, createDocumentHistory } from '../host.ts';

describe('low-code editor history', () => {
  it('undoes and redoes document commits without a Studio host', () => {
    const snapshot = createDemoBoardSnapshot();
    const draft: LowCodeDraftDocument = {
      ...snapshot.definition,
      draftId: 'memory',
    };
    const history = createDocumentHistory(draft);
    const next = cloneDraft(draft);
    next.tree.props = { padding: '24px' };
    history.commit(next);
    expect(history.current().tree.props).toEqual({ padding: '24px' });
    expect(history.undo().tree.props).toEqual({ padding: '12px' });
    expect(history.redo().tree.props).toEqual({ padding: '24px' });
  });

  it('cloneDraft works on Vue reactive drafts (structuredClone cannot)', () => {
    const snapshot = createDemoBoardSnapshot();
    const draft = reactive({
      ...snapshot.definition,
      draftId: 'reactive',
    }) as LowCodeDraftDocument;
    expect(() => structuredClone(draft)).toThrow(/could not be cloned/i);
    const cloned = cloneDraft(draft);
    expect(cloned.draftId).toBe('reactive');
    expect(cloned.tree.id).toBe(draft.tree.id);
    cloned.tree.props = { padding: '99px' };
    expect(draft.tree.props).not.toEqual({ padding: '99px' });
  });
});
