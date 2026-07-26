import { describe, expect, it } from 'vitest';

import {
  readTaskGuideState,
  resolveHelpTopic,
  writeTaskGuideState,
} from '../helpCenter';

describe('help center contract', () => {
  it('maps exact and prefix help keys to stable product help routes', () => {
    expect(resolveHelpTopic('integration.access-request').path).toBe(
      '/help/consumer/find-request',
    );
    expect(resolveHelpTopic('settings.configuration').path).toBe(
      '/help/admin/settings',
    );
  });

  it('persists versioned task guide completion state', () => {
    let raw = '';
    const storage = {
      getItem: () => raw,
      setItem: (_key: string, value: string) => {
        raw = value;
      },
    };
    const state = readTaskGuideState(storage);
    state['first-request'] = true;
    writeTaskGuideState(storage, state);
    expect(readTaskGuideState(storage)['first-request']).toBe(true);
  });
});
