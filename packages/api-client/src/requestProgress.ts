import NProgress from 'nprogress';

import type { RequestProgressOptions } from './types';

const isTest = import.meta.env.MODE === 'test';

let configured = false;
let progressEnabled = true;
let pendingRequestCount = 0;

function ensureConfigured(): void {
  if (configured || isTest || !progressEnabled) {
    return;
  }
  configured = true;
  NProgress.configure({
    showSpinner: false,
    minimum: 0.08,
    trickleSpeed: 120,
  });
}

export function configureRequestProgress(
  options: RequestProgressOptions = {},
): void {
  if (options.enabled !== undefined) {
    progressEnabled = options.enabled;
  }
  if (isTest || !progressEnabled) {
    return;
  }
  ensureConfigured();
  NProgress.configure({
    ...(options.minimum !== undefined ? { minimum: options.minimum } : {}),
    ...(options.trickleSpeed !== undefined
      ? { trickleSpeed: options.trickleSpeed }
      : {}),
    ...(options.showSpinner !== undefined
      ? { showSpinner: options.showSpinner }
      : {}),
  });
}

export function beginRequestProgress(): void {
  if (isTest || !progressEnabled) {
    return;
  }
  ensureConfigured();
  if (pendingRequestCount === 0) {
    NProgress.start();
  }
  pendingRequestCount += 1;
}

export function endRequestProgress(): void {
  if (isTest || !progressEnabled) {
    return;
  }
  pendingRequestCount = Math.max(0, pendingRequestCount - 1);
  if (pendingRequestCount === 0) {
    NProgress.done();
  }
}

export function trackRequestProgress<T>(promise: Promise<T>): Promise<T> {
  beginRequestProgress();
  return promise.finally(() => {
    endRequestProgress();
  });
}
