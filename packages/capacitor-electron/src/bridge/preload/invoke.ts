import { BridgeError } from '../../shared/errors/bridge-error';
import { BRIDGE_ERROR_CODES } from '../../shared/errors/codes';
import {
  BRIDGE_INVOKE_CHANNEL,
  BRIDGE_PROTOCOL_VERSION,
} from '../../shared/protocol/constants';
import type { BridgeMethod } from '../../shared/protocol/constants';
import type {
  BridgeRequest,
  BridgeResponse,
  MethodPayloadMap,
  MethodResultMap,
} from '../../shared/protocol/types';
import { isBridgeResponse } from '../../shared/schema/validators';

import type { IpcInvoke, InvokeOptions } from './types';
import { createRequestId } from './utils/request';
import { validatePayload } from './utils/validate';

export function createPreloadInvoker(ipcInvoke: IpcInvoke) {
  return async function invoke<TMethod extends keyof MethodPayloadMap>(
    method: TMethod,
    payload: MethodPayloadMap[TMethod],
    options: InvokeOptions = {},
  ): Promise<MethodResultMap[TMethod]> {
    validatePayload(method, payload);

    if (options.signal?.aborted) {
      throw new BridgeError(
        BRIDGE_ERROR_CODES.timeout,
        'Request aborted before dispatch.',
      );
    }

    const request: BridgeRequest = {
      protocolVersion: BRIDGE_PROTOCOL_VERSION,
      requestId: createRequestId(),
      method: method as BridgeMethod,
      payload,
      meta: {
        timeoutMs: options.timeoutMs,
        source: 'capacitor-webview',
      },
    };

    const responsePromise = ipcInvoke(BRIDGE_INVOKE_CHANNEL, request);
    const guardedPromise = options.signal
      ? Promise.race([
          responsePromise,
          new Promise<never>((_resolve, reject) => {
            options.signal?.addEventListener(
              'abort',
              () => {
                reject(
                  new BridgeError(
                    BRIDGE_ERROR_CODES.timeout,
                    'Request aborted.',
                  ),
                );
              },
              { once: true },
            );
          }),
        ])
      : responsePromise;

    const rawResponse = await guardedPromise;

    if (!isBridgeResponse(rawResponse)) {
      throw new BridgeError(
        BRIDGE_ERROR_CODES.internalError,
        'Invalid bridge response shape.',
      );
    }

    const response = rawResponse as BridgeResponse<MethodResultMap[TMethod]>;

    if (!response.ok) {
      throw new BridgeError(response.error.code, response.error.message, {
        traceId: response.traceId,
        ...(typeof response.error.details === 'object'
          ? (response.error.details as Record<string, unknown>)
          : {}),
      });
    }

    return response.data;
  };
}
