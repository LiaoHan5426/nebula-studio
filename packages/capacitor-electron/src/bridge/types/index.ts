import type { BridgeLogger } from '../../shared/observability/logger';

export type MainDispatcherOptions = {
  defaultTimeoutMs?: number;
  logger?: BridgeLogger;
};
