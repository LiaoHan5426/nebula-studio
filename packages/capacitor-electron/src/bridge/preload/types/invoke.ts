// ipc invoke types for preload script
import type { BridgeRequest } from '../../../shared/protocol/types';
export type IpcInvoke = (
  channel: string,
  request: BridgeRequest,
) => Promise<unknown>;

export type InvokeOptions = {
  timeoutMs?: number;
  signal?: AbortSignal;
};
