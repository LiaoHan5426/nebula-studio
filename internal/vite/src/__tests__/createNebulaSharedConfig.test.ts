import { describe, expect, it } from 'vitest';

import { createNebulaSharedConfig } from '../federation/createNebulaSharedConfig.ts';

describe('createNebulaSharedConfig', () => {
  it('defaults to vue singleton and application-contract', () => {
    const shared = createNebulaSharedConfig();
    expect(shared.vue).toMatchObject({ singleton: true, eager: false });
    expect(shared['@nebula-studio/application-contract']).toMatchObject({
      singleton: true,
    });
    expect(shared['vue-router']).toBeUndefined();
  });

  it('can opt into vue-router without making it eager', () => {
    const shared = createNebulaSharedConfig({
      libraries: ['vue', 'vue-router'],
    });
    expect(shared['vue-router']).toMatchObject({
      singleton: true,
      eager: false,
    });
  });
});
