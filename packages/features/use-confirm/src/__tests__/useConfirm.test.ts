import { describe, expect, it } from 'vitest';
import { answerConfirm, cancelAllConfirms, useConfirm } from '../index.ts';

describe('useConfirm queue', () => {
  it('serializes concurrent confirm requests', async () => {
    const first = useConfirm('first');
    const second = useConfirm('second');

    answerConfirm(true);
    await expect(first).resolves.toBe(true);

    answerConfirm(false);
    await expect(second).resolves.toBe(false);
  });

  it('cancelAllConfirms resolves pending with default false', async () => {
    const pending = useConfirm('pending');
    cancelAllConfirms(false);
    await expect(pending).resolves.toBe(false);
  });
});
