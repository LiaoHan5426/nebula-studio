import type { FrontendRuntimeEntry } from '@nebula-studio/contracts/system';

import type { StaticRemoteRegistration } from './frontendRuntime.ts';
import type { RemoteTelemetryReporter } from './remoteTelemetry.ts';

import {
  federationRegistrationFromRuntime,
  findFederationRuntimeEntry,
  isLocalFederationFallbackId,
  localFederationRegistration,
} from './frontendRuntime.ts';
import { assertHttpManifestIntegrity } from './manifestIntegrity.ts';
import { reportRemoteTelemetry } from './remoteTelemetry.ts';

export const FRONTEND_LKG_STORAGE_KEY = 'nebula.frontend.lkg.v1';
export const FRONTEND_BREAKER_STORAGE_KEY = 'nebula.frontend.breaker.v1';

export const FEDERATION_LOAD_TIMEOUT_MS = 15_000;
export const REMOTE_BREAKER_FAILURE_LIMIT = 3;
export const REMOTE_BREAKER_WINDOW_MS = 10 * 60 * 1000;
export const REMOTE_BREAKER_OPEN_MS = 5 * 60 * 1000;

export interface KvStore {
  getItem(key: string): null | string;
  setItem(key: string, value: string): void;
}

type LkgMap = Record<string, StaticRemoteRegistration & { savedAt: number }>;
type BreakerMap = Record<string, { failures: number[]; openUntil?: number }>;

export function createMemoryKv(initial?: Record<string, string>): KvStore {
  const data = { ...initial };
  return {
    getItem(key) {
      return data[key] ?? null;
    },
    setItem(key, value) {
      data[key] = value;
    },
  };
}

export function browserKvStore(): KvStore {
  try {
    if (typeof localStorage === 'undefined') {
      return createMemoryKv();
    }
    return localStorage;
  } catch {
    return createMemoryKv();
  }
}

function readJson<T>(store: KvStore, key: string, fallback: T): T {
  try {
    const raw = store.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(store: KvStore, key: string, value: unknown): void {
  store.setItem(key, JSON.stringify(value));
}

export function isInRolloutCohort(
  rolloutPercent: number | undefined,
  seed: string,
): boolean {
  if (rolloutPercent === undefined) return true;
  if (rolloutPercent >= 100) return true;
  if (rolloutPercent <= 0) return false;
  const bucket = hashToBucket(seed);
  return bucket < rolloutPercent;
}

function hashToBucket(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 100;
}

export function sameRemoteRegistration(
  left: StaticRemoteRegistration,
  right: StaticRemoteRegistration,
): boolean {
  return (
    left.name === right.name &&
    left.expose === right.expose &&
    left.entry === right.entry
  );
}

export function readLastKnownGood(
  applicationId: string,
  store: KvStore = browserKvStore(),
): null | StaticRemoteRegistration {
  const map = readJson<LkgMap>(store, FRONTEND_LKG_STORAGE_KEY, {});
  const row = map[applicationId];
  if (!row?.name || !row.entry || !row.expose) return null;
  return {
    name: row.name,
    expose: row.expose,
    entry: row.entry,
    integrity: row.integrity,
    signature: row.signature,
    version: row.version,
  };
}

export function writeLastKnownGood(
  applicationId: string,
  registration: StaticRemoteRegistration,
  store: KvStore = browserKvStore(),
  now = Date.now(),
): void {
  const map = readJson<LkgMap>(store, FRONTEND_LKG_STORAGE_KEY, {});
  map[applicationId] = { ...registration, savedAt: now };
  writeJson(store, FRONTEND_LKG_STORAGE_KEY, map);
}

export function isCircuitOpen(
  applicationId: string,
  store: KvStore = browserKvStore(),
  now = Date.now(),
): boolean {
  const map = readJson<BreakerMap>(store, FRONTEND_BREAKER_STORAGE_KEY, {});
  const row = map[applicationId];
  return Boolean(row?.openUntil && row.openUntil > now);
}

export function recordRemoteSuccess(
  applicationId: string,
  store: KvStore = browserKvStore(),
): void {
  const map = readJson<BreakerMap>(store, FRONTEND_BREAKER_STORAGE_KEY, {});
  delete map[applicationId];
  writeJson(store, FRONTEND_BREAKER_STORAGE_KEY, map);
}

export function recordRemoteFailure(
  applicationId: string,
  store: KvStore = browserKvStore(),
  now = Date.now(),
): { failures: number; open: boolean } {
  const map = readJson<BreakerMap>(store, FRONTEND_BREAKER_STORAGE_KEY, {});
  const previous = map[applicationId] ?? { failures: [] };
  const failures = [...previous.failures, now].filter(
    (stamp) => now - stamp <= REMOTE_BREAKER_WINDOW_MS,
  );
  const open = failures.length >= REMOTE_BREAKER_FAILURE_LIMIT;
  map[applicationId] = {
    failures,
    openUntil: open ? now + REMOTE_BREAKER_OPEN_MS : previous.openUntil,
  };
  writeJson(store, FRONTEND_BREAKER_STORAGE_KEY, map);
  return { failures: failures.length, open };
}

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

export function resolveFederationRegistrationWithPolicy(options: {
  applicationId: string;
  entries: readonly FrontendRuntimeEntry[];
  httpEntryOverride?: string;
  rolloutSeed: string;
  store?: KvStore;
}): null | StaticRemoteRegistration {
  const store = options.store ?? browserKvStore();
  const entry = findFederationRuntimeEntry(
    options.entries,
    options.applicationId,
  );
  if (entry && isInRolloutCohort(entry.rolloutPercent, options.rolloutSeed)) {
    return federationRegistrationFromRuntime(entry, {
      httpEntryOverride: options.httpEntryOverride,
    });
  }
  const lkg = readLastKnownGood(options.applicationId, store);
  if (lkg) return lkg;
  if (isLocalFederationFallbackId(options.applicationId)) {
    return localFederationRegistration(
      options.applicationId,
      options.httpEntryOverride,
    );
  }
  return null;
}

export async function mountWithLastKnownGood<T>(options: {
  applicationId: string;
  live: StaticRemoteRegistration;
  mount: (registration: StaticRemoteRegistration) => Promise<T>;
  now?: number;
  report?: RemoteTelemetryReporter;
  store?: KvStore;
  verifyIntegrity?: (registration: StaticRemoteRegistration) => Promise<void>;
}): Promise<T> {
  const store = options.store ?? browserKvStore();
  const now = options.now ?? Date.now();
  const live = options.live;
  const verify = options.verifyIntegrity ?? assertHttpManifestIntegrityForLive;
  const emit = (
    eventType: Parameters<typeof reportRemoteTelemetry>[1]['eventType'],
    extra?: {
      message?: string;
      registration?: StaticRemoteRegistration;
    },
  ) => {
    const registration = extra?.registration ?? live;
    reportRemoteTelemetry(options.report, {
      applicationId: options.applicationId,
      entry: registration.entry,
      eventType,
      message: extra?.message,
      version: registration.version,
    });
  };

  if (isCircuitOpen(options.applicationId, store, now)) {
    const lkg = readLastKnownGood(options.applicationId, store);
    if (lkg) {
      console.warn(
        `[federation] circuit open for "${options.applicationId}", mounting last-known-good`,
      );
      emit('circuit_open');
      emit('lkg_used', { registration: lkg });
      return options.mount(lkg);
    }
  }

  try {
    await verify(live);
    const handle = await options.mount(live);
    writeLastKnownGood(options.applicationId, live, store, now);
    recordRemoteSuccess(options.applicationId, store);
    emit('live_success');
    return handle;
  } catch (liveError) {
    const message =
      liveError instanceof Error ? liveError.message : String(liveError);
    if (message.includes('integrity mismatch')) {
      emit('integrity_mismatch', { message });
    } else if (message.includes('signature mismatch')) {
      emit('signature_mismatch', { message });
    } else {
      emit('live_failure', { message });
    }
    recordRemoteFailure(options.applicationId, store, now);
    const lkg = readLastKnownGood(options.applicationId, store);
    if (lkg && !sameRemoteRegistration(lkg, live)) {
      console.warn(
        `[federation] live mount failed for "${options.applicationId}", mounting last-known-good`,
        liveError,
      );
      emit('lkg_used', { registration: lkg, message });
      return options.mount(lkg);
    }
    throw liveError;
  }
}

async function assertHttpManifestIntegrityForLive(
  registration: StaticRemoteRegistration,
): Promise<void> {
  await assertHttpManifestIntegrity(
    registration.entry,
    registration.integrity,
    registration.signature,
  );
}
