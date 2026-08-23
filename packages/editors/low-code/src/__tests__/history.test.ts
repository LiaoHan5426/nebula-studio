import type { LowCodeDraftDocument } from '@nebula-studio/low-code-contract';

import { createDemoBoardSnapshot } from '@nebula-studio/low-code-contract';

import { describe, expect, it } from 'vitest';

import { createDocumentHistory } from '../host.ts';

describe('low-code editor history', () => {
  it('undoes and redoes document commits without a Studio host', () => {
    const snapshot = createDemoBoardSnapshot();
    const draft: LowCodeDraftDocument = {
      ...snapshot.definition,
      draftId: 'memory',
    };
    const history = createDocumentHistory(draft);
    const next = structuredClone(draft);
    next.tree.props = { padding: '24px' };
    history.commit(next);
    expect(history.current().tree.props).toEqual({ padding: '24px' });
    expect(history.undo().tree.props).toEqual({ padding: '12px' });
    expect(history.redo().tree.props).toEqual({ padding: '24px' });
  });
});
