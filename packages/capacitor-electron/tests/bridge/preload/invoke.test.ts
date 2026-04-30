import { describe, expect, it } from 'vite-plus/test';
import { createPreloadInvoker } from '../../../src/bridge/preload/invoke';
import { BRIDGE_ERROR_CODES } from '../../../src/shared/errors/codes';
import {
  BRIDGE_METHODS,
  BRIDGE_PROTOCOL_VERSION,
} from '../../../src/shared/protocol/constants';

describe('bridge/preload/invoke', () => {
  it('sends request to fixed invoke channel', async () => {
    let seenChannel = '';
    const invoke = createPreloadInvoker(async (channel, request) => {
      seenChannel = channel;
      return {
        ok: true as const,
        requestId: request.requestId,
        data: {
          protocolVersion: BRIDGE_PROTOCOL_VERSION,
          supportedProtocolVersions: [BRIDGE_PROTOCOL_VERSION],
          capacitorVersion: '8.0.0',
          electronVersion: '34.0.0',
          nodeVersion: process.versions.node,
          platform: process.platform,
          capabilities: ['runtime.getInfo'],
        },
      };
    });

    await invoke(BRIDGE_METHODS.runtimeGetInfo, {});
    expect(seenChannel).toBe('nebula-studio:electron:v1:invoke');
  });

  it('throws INVALID_PARAMS when payload is invalid', async () => {
    const invoke = createPreloadInvoker(async () => {
      throw new Error('should not be called');
    });

    await expect(
      invoke(BRIDGE_METHODS.externalOpen, {} as never),
    ).rejects.toMatchObject({
      code: BRIDGE_ERROR_CODES.invalidParams,
    });
  });

  it('throws bridge error when response shape is invalid', async () => {
    const invoke = createPreloadInvoker(async () => ({ bad: true }));

    await expect(
      invoke(BRIDGE_METHODS.runtimeGetInfo, {}),
    ).rejects.toMatchObject({
      code: BRIDGE_ERROR_CODES.internalError,
    });
  });

  it('maps error response to thrown BridgeError', async () => {
    const invoke = createPreloadInvoker(async (_channel, request) => ({
      ok: false as const,
      requestId: request.requestId,
      error: {
        code: BRIDGE_ERROR_CODES.unsupportedOperation,
        message: 'unsupported',
      },
    }));

    await expect(
      invoke(BRIDGE_METHODS.runtimeGetInfo, {}),
    ).rejects.toMatchObject({
      code: BRIDGE_ERROR_CODES.unsupportedOperation,
      message: 'unsupported',
    });
  });

  it('includes traceId from error response details', async () => {
    const invoke = createPreloadInvoker(async (_channel, request) => ({
      ok: false as const,
      requestId: request.requestId,
      traceId: 'trace-bridge-1',
      error: {
        code: BRIDGE_ERROR_CODES.internalError,
        message: 'internal',
      },
    }));

    await expect(
      invoke(BRIDGE_METHODS.runtimeGetInfo, {}),
    ).rejects.toMatchObject({
      code: BRIDGE_ERROR_CODES.internalError,
      details: {
        traceId: 'trace-bridge-1',
      },
    });
  });
});
