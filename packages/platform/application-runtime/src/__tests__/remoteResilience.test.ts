import type { FrontendRuntimeEntry } from '@nebula-studio/contracts/system';

import { describe, expect, it } from 'vitest';

import {
  createMemoryKv,
  isInRolloutCohort,
  mountWithLastKnownGood,
  readLastKnownGood,
  recordRemoteFailure,
  REMOTE_BREAKER_FAILURE_LIMIT,
  resolveFederationRegistrationWithPolicy,
  withTimeout,
  writeLastKnownGood,
} from '../remoteResilience.ts';

const docs: FrontendRuntimeEntry = {
  category: 'shell',
  contractVersion: 1,
  driver: 'federation',
  electronEnabled: true,
  exposedModule: './application',
  id: 'docs',
  manifestUrl: 'http://localhost:5176/mf-manifest.json',
  name: '文档',
  remoteName: 'nebula_docs',
  roles: ['public'],
  rolloutPercent: 100,
  source: 'frontend',
  webEnabled: true,
};

describe('remote resilience', () => {
  it('places rollout buckets stably for a seed', () => {
    expect(isInRolloutCohort(100, 'tenant-a:admin')).toBe(true);
    expect(isInRolloutCohort(0, 'tenant-a:admin')).toBe(false);
    const seed = 'tenant-a:admin';
    expect(isInRolloutCohort(50, seed)).toBe(isInRolloutCohort(50, seed));
  });

  it('keeps last-known-good and uses it when live mount fails', async () => {
    const store = createMemoryKv();
    const live = {
      name: 'nebula_docs',
      expose: 'application',
      entry: 'http://localhost:5176/broken.json',
    };
    const good = {
      name: 'nebula_docs',
      expose: 'application',
      entry: 'http://localhost:5176/mf-manifest.json',
    };
    writeLastKnownGood('docs', good, store, 1);
    const mounted: string[] = [];
    await mountWithLastKnownGood({
      applicationId: 'docs',
      live,
      store,
      mount: async (registration) => {
        mounted.push(registration.entry);
        if (registration.entry.includes('broken')) {
          throw new Error('live failed');
        }
        return 'ok';
      },
    });
    expect(mounted).toEqual([live.entry, good.entry]);
    expect(readLastKnownGood('docs', store)?.entry).toBe(good.entry);
  });

  it('skips live mount while the circuit is open if LKG exists', async () => {
    const store = createMemoryKv();
    const good = {
      name: 'nebula_docs',
      expose: 'application',
      entry: 'http://localhost:5176/mf-manifest.json',
    };
    writeLastKnownGood('docs', good, store, 1);
    const now = 10_000;
    for (let i = 0; i < REMOTE_BREAKER_FAILURE_LIMIT; i += 1) {
      recordRemoteFailure('docs', store, now);
    }
    const mounted: string[] = [];
    await mountWithLastKnownGood({
      applicationId: 'docs',
      live: { ...good, entry: 'http://localhost:5176/next.json' },
      store,
      now,
      mount: async (registration) => {
        mounted.push(registration.entry);
        return 'ok';
      },
    });
    expect(mounted).toEqual([good.entry]);
  });

  it('falls back to LKG when the current version is outside the gray cohort', () => {
    const store = createMemoryKv();
    writeLastKnownGood(
      'docs',
      {
        name: 'nebula_docs',
        expose: 'application',
        entry: 'http://localhost:5176/lkg.json',
      },
      store,
      1,
    );
    const registration = resolveFederationRegistrationWithPolicy({
      applicationId: 'docs',
      entries: [{ ...docs, rolloutPercent: 0 }],
      rolloutSeed: 'tenant-a:admin',
      store,
    });
    expect(registration?.entry).toBe('http://localhost:5176/lkg.json');
  });

  it('times out slow federation loads', async () => {
    await expect(
      withTimeout(
        new Promise(() => undefined),
        20,
        'federation load timed out',
      ),
    ).rejects.toThrow(/timed out/);
  });

  it('emits telemetry and uses LKG when live integrity fails', async () => {
    const store = createMemoryKv();
    const good = {
      name: 'nebula_docs',
      expose: 'application',
      entry: 'http://localhost:5176/mf-manifest.json',
      version: '1.0.0',
    };
    const live = {
      ...good,
      entry: 'http://localhost:5176/next.json',
      integrity: 'sha384-dead',
      version: '1.1.0',
    };
    writeLastKnownGood('docs', good, store, 1);
    const events: string[] = [];
    await mountWithLastKnownGood({
      applicationId: 'docs',
      live,
      store,
      report: (event) => {
        events.push(event.eventType);
      },
      verifyIntegrity: async () => {
        throw new Error('manifest integrity mismatch for live');
      },
      mount: async (registration) => registration.entry,
    });
    expect(events).toEqual(['integrity_mismatch', 'lkg_used']);
  });

  it('emits signature_mismatch telemetry when the live signature fails', async () => {
    const store = createMemoryKv();
    const good = {
      name: 'nebula_docs',
      expose: 'application',
      entry: 'http://localhost:5176/mf-manifest.json',
    };
    writeLastKnownGood('docs', good, store, 1);
    const events: string[] = [];
    await mountWithLastKnownGood({
      applicationId: 'docs',
      live: {
        ...good,
        entry: 'http://localhost:5176/next.json',
        signature: 'bad',
      },
      store,
      report: (event) => {
        events.push(event.eventType);
      },
      verifyIntegrity: async () => {
        throw new Error('manifest signature mismatch for live');
      },
      mount: async (registration) => registration.entry,
    });
    expect(events).toEqual(['signature_mismatch', 'lkg_used']);
  });
});
