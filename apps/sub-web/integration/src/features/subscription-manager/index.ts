/**
 * Public feature boundary for subscription management.
 *
 * The legacy `features/subscriptions` page remains as the route shell while
 * API, mapping and orchestration are consumed through this stable entry.
 */
export { subscriptionApi } from '@/features/subscription/api';
export { useSubscriptionsPage } from '@/features/subscriptions/composables/useSubscriptionsPage';
export {
  buildCreateConfig,
  mapSubscriptionList,
  pollingIntervalLabel,
  pollingIntervalSec,
  statusVariant,
} from '@/features/subscriptions/mappers';
export type {
  CreateFormDraft,
  StatusVariant,
  SubscriptionFormState,
} from '@/features/subscriptions/types';
