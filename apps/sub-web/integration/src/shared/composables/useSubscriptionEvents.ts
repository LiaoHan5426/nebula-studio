import type {
  SseConnectionState,
  SseEventRecord,
} from './subscriptionEventsCore';

import { CAMEL_SUBSCRIBE_BASE } from '@/shared/api/client';
import { hostAuthToken } from '@/shared/hostCapabilityBridge';

/**
 * Integration-owned SSE subscription events composition.
 *
 * This file re-exports the core composable with integration-app defaults
 * (INTEGRATION_BASE URL and auth token) so existing imports continue to work.
 */
import { useSubscriptionEvents as useCoreSubscriptionEvents } from './subscriptionEventsCore';

export type { SseConnectionState, SseEventRecord };

export function useSubscriptionEvents() {
  return useCoreSubscriptionEvents({
    baseUrl: CAMEL_SUBSCRIBE_BASE,
    getAuthToken: hostAuthToken,
  });
}
