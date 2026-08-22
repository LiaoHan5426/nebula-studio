import { describe, expect, it } from 'vitest';

import {
  assertIframeMethodPayload,
  createIframeCapabilityHost,
  createIframeHandshakeMessage,
  IFRAME_CAPABILITY_PROTOCOL,
  isIframeHandshakeMessage,
  negotiateIframeProtocolVersion,
} from '../iframeBridge';

describe('iframe capability bridge', () => {
  it('recognizes handshake messages and rejects incomplete payloads', () => {
    const message = createIframeHandshakeMessage('iframe-demo', 'nonce-1');
    expect(message.protocol).toBe(IFRAME_CAPABILITY_PROTOCOL);
    expect(message.minProtocolVersion).toBe(1);
    expect(isIframeHandshakeMessage(message)).toBe(true);
    expect(isIframeHandshakeMessage({ type: 'nebula-iframe-handshake' })).toBe(
      false,
    );
  });

  it('negotiates protocol v1 and rejects unknown versions', () => {
    expect(negotiateIframeProtocolVersion(1)).toBe(1);
    expect(negotiateIframeProtocolVersion(0)).toBeNull();
    expect(negotiateIframeProtocolVersion(2)).toBeNull();
  });

  it('rejects ping payloads that could carry secrets', () => {
    expect(() => assertIframeMethodPayload('ping', { token: 'nope' })).toThrow(
      /empty/,
    );
    expect(() => assertIframeMethodPayload('ping', undefined)).not.toThrow();
  });

  it('roundtrips ping over MessageChannel and rejects unknown methods', async () => {
    const channel = new MessageChannel();
    channel.port1.addEventListener('message', (event: MessageEvent) => {
      const request = event.data as {
        method?: string;
        requestId?: string;
        type?: string;
      };
      if (request.type !== 'request' || !request.requestId) return;
      if (request.method !== 'ping') {
        channel.port1.postMessage({
          type: 'response',
          requestId: request.requestId,
          error: `method "${request.method}" is not allowed`,
        });
        return;
      }
      channel.port1.postMessage({
        type: 'response',
        requestId: request.requestId,
        payload: 'pong',
      });
    });
    channel.port1.start();
    const bridge = createIframeCapabilityHost(channel.port2, new Set(['ping']));
    await expect(bridge.request('ping')).resolves.toBe('pong');
    await expect(bridge.request('logout')).rejects.toThrow(/not allowed/);
    bridge.dispose();
  });

  it('times out hanging requests and ignores late responses after dispose', async () => {
    const channel = new MessageChannel();
    channel.port1.start();
    const bridge = createIframeCapabilityHost(channel.port2);
    await expect(
      bridge.request('ping', undefined, { timeoutMs: 20 }),
    ).rejects.toThrow(/timed out/);
    const late = bridge.request('ping', undefined, { timeoutMs: 5_000 });
    bridge.dispose();
    await expect(late).rejects.toThrow(/disposed/);
  });

  it('cancels an in-flight request', async () => {
    const channel = new MessageChannel();
    channel.port1.start();
    const bridge = createIframeCapabilityHost(channel.port2);
    const pending = bridge.request('ping', undefined, { timeoutMs: 5_000 });
    queueMicrotask(() => bridge.cancel());
    await expect(pending).rejects.toThrow(/cancelled/);
    bridge.dispose();
  });
});
