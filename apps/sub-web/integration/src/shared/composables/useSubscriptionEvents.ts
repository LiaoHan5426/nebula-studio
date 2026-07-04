/**
 * SSE subscription events composable — delegates to `@nebula-studio/sse-events`.
 *
 * This file re-exports the core composable with integration-app defaults
 * (INTEGRATION_BASE URL and auth token) so existing imports continue to work.
 */
import { useSubscriptionEvents as useCoreSubscriptionEvents } from '@nebula-studio/sse-events';
import type {
  SseEventRecord,
  SseConnectionState,
} from '@nebula-studio/sse-events';

import { CAMEL_SUBSCRIBE_BASE } from '@/shared/api/client';
import { getAuthToken } from '@/shared/auth/session';

export type { SseEventRecord, SseConnectionState };

export function useSubscriptionEvents() {
  return useCoreSubscriptionEvents({
    baseUrl: CAMEL_SUBSCRIBE_BASE,
    getAuthToken,
  });
}
