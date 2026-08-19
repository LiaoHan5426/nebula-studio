import { describe, expect, it } from 'vitest';

import { toGeneratedTaskCreateRequest } from '../mappers.ts';
import { TaskType } from '../task.ts';

describe('integration contract mappers', () => {
  it('maps app-facing task create payload to generated wire shape', () => {
    expect(
      toGeneratedTaskCreateRequest({
        name: 'nightly-sync',
        taskType: TaskType.CRON,
        triggerType: 'CRON',
        cronExpression: '0 0 * * *',
        payload: '{"mode":"full"}',
      }),
    ).toEqual({
      taskName: 'nightly-sync',
      taskType: TaskType.CRON,
      triggerType: 'CRON',
      cronExpression: '0 0 * * *',
      taskConfig: '{"mode":"full"}',
      tenantId: undefined,
    });
  });
});
