export const IFRAME_CAPABILITY_PROTOCOL = 'nebula-iframe-capability';
export const IFRAME_CAPABILITY_PROTOCOL_VERSION = 1;
export const IFRAME_CAPABILITY_MIN_PROTOCOL_VERSION = 1;
export const IFRAME_REQUEST_TIMEOUT_MS = 4000;

export const IFRAME_HANDSHAKE_TYPE = 'nebula-iframe-handshake';
export const IFRAME_HANDSHAKE_ACK_TYPE = 'nebula-iframe-handshake-ack';

const DEFAULT_METHODS = new Set(['ping']);

export interface IframeHandshakeMessage {
  appId: string;
  minProtocolVersion: number;
  nonce: string;
  protocol: typeof IFRAME_CAPABILITY_PROTOCOL;
  protocolVersion: number;
  type: typeof IFRAME_HANDSHAKE_TYPE;
}

export interface IframeHandshakeAckMessage {
  nonce: string;
  protocol: typeof IFRAME_CAPABILITY_PROTOCOL;
  protocolVersion: number;
  type: typeof IFRAME_HANDSHAKE_ACK_TYPE;
}

export interface IframeCapabilityRequest {
  appId: string;
  capability: string;
  method: string;
  payload?: unknown;
  protocolVersion: number;
  requestId: string;
  type: 'request';
}

export interface IframeCapabilityResponse {
  error?: string;
  payload?: unknown;
  requestId: string;
  type: 'response';
}

export interface IframeCapabilityCancel {
  requestId: string;
  type: 'cancel';
}

export interface IframeCapabilityDispose {
  type: 'dispose';
}

export interface IframeCapabilityBridge {
  cancel(requestId?: string): void;
  dispose(): void;
  request(
    method: string,
    payload?: unknown,
    options?: { signal?: AbortSignal; timeoutMs?: number },
  ): Promise<unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function negotiateIframeProtocolVersion(
  guestVersion: number,
  hostVersion = IFRAME_CAPABILITY_PROTOCOL_VERSION,
  minVersion = IFRAME_CAPABILITY_MIN_PROTOCOL_VERSION,
): null | number {
  if (!Number.isInteger(guestVersion)) {
    return null;
  }
  if (guestVersion < minVersion || guestVersion > hostVersion) {
    return null;
  }
  return guestVersion;
}

export function isCloneablePayload(value: unknown): boolean {
  if (value === undefined) {
    return true;
  }
  try {
    structuredClone(value);
    return true;
  } catch {
    return false;
  }
}

export function assertIframeMethodPayload(
  method: string,
  payload: unknown,
): void {
  if (!isCloneablePayload(payload)) {
    throw new Error(`method "${method}" payload is not structured-cloneable`);
  }
  if (method === 'ping') {
    if (payload === undefined || payload === null) {
      return;
    }
    if (isRecord(payload) && Object.keys(payload).length === 0) {
      return;
    }
    throw new Error('ping payload must be empty');
  }
}

export function isIframeHandshakeMessage(
  value: unknown,
): value is IframeHandshakeMessage {
  return (
    isRecord(value) &&
    value.type === IFRAME_HANDSHAKE_TYPE &&
    value.protocol === IFRAME_CAPABILITY_PROTOCOL &&
    typeof value.protocolVersion === 'number' &&
    typeof value.nonce === 'string' &&
    typeof value.appId === 'string'
  );
}

export function isIframeHandshakeAckMessage(
  value: unknown,
): value is IframeHandshakeAckMessage {
  return (
    isRecord(value) &&
    value.type === IFRAME_HANDSHAKE_ACK_TYPE &&
    value.protocol === IFRAME_CAPABILITY_PROTOCOL &&
    typeof value.protocolVersion === 'number' &&
    typeof value.nonce === 'string'
  );
}

export function createIframeHandshakeMessage(
  appId: string,
  nonce = crypto.randomUUID(),
): IframeHandshakeMessage {
  return {
    type: IFRAME_HANDSHAKE_TYPE,
    protocol: IFRAME_CAPABILITY_PROTOCOL,
    protocolVersion: IFRAME_CAPABILITY_PROTOCOL_VERSION,
    minProtocolVersion: IFRAME_CAPABILITY_MIN_PROTOCOL_VERSION,
    nonce,
    appId,
  };
}

export async function connectIframeCapabilityBridge(options: {
  allowedOrigin: string;
  appId: string;
  iframe: Pick<HTMLIFrameElement, 'contentWindow'>;
  methods?: ReadonlySet<string>;
  timeoutMs?: number;
}): Promise<IframeCapabilityBridge> {
  const target = options.iframe.contentWindow;
  if (!target) {
    throw new Error('iframe has no contentWindow');
  }
  if (options.allowedOrigin === '*') {
    throw new Error('iframe capability bridge forbids wildcard origin');
  }
  const methods = options.methods ?? DEFAULT_METHODS;
  const handshake = createIframeHandshakeMessage(options.appId);
  const timeoutMs = options.timeoutMs ?? IFRAME_REQUEST_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener('message', onMessage);
      reject(new Error('iframe capability handshake timed out'));
    }, timeoutMs);

    function onMessage(event: MessageEvent): void {
      if (event.origin !== options.allowedOrigin) return;
      if (event.source !== target) return;
      if (!isIframeHandshakeAckMessage(event.data)) return;
      if (event.data.nonce !== handshake.nonce) return;
      if (negotiateIframeProtocolVersion(event.data.protocolVersion) === null) {
        window.clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        reject(
          new Error(
            `iframe capability protocol version ${String(event.data.protocolVersion)} is not supported`,
          ),
        );
        return;
      }
      const port = event.ports[0];
      if (!port) return;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      resolve(bindHostPort(port, methods, options.appId));
    }

    window.addEventListener('message', onMessage);
    target.postMessage(handshake, options.allowedOrigin);
  });
}

export function createIframeCapabilityHost(
  port: MessagePort,
  methods: ReadonlySet<string> = DEFAULT_METHODS,
  appId = 'iframe-demo',
): IframeCapabilityBridge {
  return bindHostPort(port, methods, appId);
}

function bindHostPort(
  port: MessagePort,
  methods: ReadonlySet<string>,
  appId: string,
): IframeCapabilityBridge {
  const pending = new Map<
    string,
    {
      reject: (error: Error) => void;
      resolve: (value: unknown) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  let disposed = false;
  function onPortMessage(event: MessageEvent): void {
    const data = event.data as IframeCapabilityResponse;
    if (
      !data ||
      data.type !== 'response' ||
      typeof data.requestId !== 'string'
    ) {
      return;
    }
    const waiter = pending.get(data.requestId);
    if (!waiter) return;
    clearTimeout(waiter.timer);
    pending.delete(data.requestId);
    if (data.error) {
      waiter.reject(new Error(data.error));
      return;
    }
    waiter.resolve(data.payload);
  }
  port.addEventListener('message', onPortMessage);
  port.start();

  function rejectPending(requestId: string | undefined, error: Error): void {
    if (!requestId) {
      for (const [id, waiter] of pending) {
        clearTimeout(waiter.timer);
        waiter.reject(error);
        pending.delete(id);
      }
      return;
    }
    const waiter = pending.get(requestId);
    if (!waiter) return;
    clearTimeout(waiter.timer);
    pending.delete(requestId);
    waiter.reject(error);
  }

  const bridge: IframeCapabilityBridge = {
    request(method, payload, options) {
      if (disposed) {
        return Promise.reject(new Error('iframe capability bridge disposed'));
      }
      if (!methods.has(method)) {
        return Promise.reject(new Error(`method "${method}" is not allowed`));
      }
      try {
        assertIframeMethodPayload(method, payload);
      } catch (error) {
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
      const requestId = crypto.randomUUID();
      const timeoutMs = options?.timeoutMs ?? IFRAME_REQUEST_TIMEOUT_MS;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          port.postMessage({
            type: 'cancel',
            requestId,
          } satisfies IframeCapabilityCancel);
          reject(new Error(`iframe capability request "${method}" timed out`));
        }, timeoutMs);
        const onAbort = (): void => {
          bridge.cancel(requestId);
        };
        options?.signal?.addEventListener('abort', onAbort, { once: true });
        pending.set(requestId, {
          resolve: (value) => {
            options?.signal?.removeEventListener('abort', onAbort);
            resolve(value);
          },
          reject: (error) => {
            options?.signal?.removeEventListener('abort', onAbort);
            reject(error);
          },
          timer,
        });
        const message: IframeCapabilityRequest = {
          type: 'request',
          protocolVersion: IFRAME_CAPABILITY_PROTOCOL_VERSION,
          requestId,
          appId,
          capability: 'host',
          method,
          payload,
        };
        port.postMessage(message);
      });
    },
    cancel(requestId) {
      if (requestId) {
        port.postMessage({
          type: 'cancel',
          requestId,
        } satisfies IframeCapabilityCancel);
        rejectPending(
          requestId,
          new Error('iframe capability request cancelled'),
        );
        return;
      }
      for (const id of [...pending.keys()]) {
        port.postMessage({
          type: 'cancel',
          requestId: id,
        } satisfies IframeCapabilityCancel);
      }
      rejectPending(
        undefined,
        new Error('iframe capability request cancelled'),
      );
    },
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      port.removeEventListener('message', onPortMessage);
      try {
        port.postMessage({ type: 'dispose' } satisfies IframeCapabilityDispose);
      } catch {
        // port may already be closed
      }
      port.close();
      rejectPending(undefined, new Error('iframe capability bridge disposed'));
    },
  };
  return bridge;
}

export function installIframeCapabilityGuest(options: {
  allowedParentOrigin: string;
  appId: string;
  handlers?: Record<string, (payload?: unknown) => unknown>;
  target?: Window;
}): () => void {
  if (options.allowedParentOrigin === '*') {
    throw new Error('iframe capability guest forbids wildcard origin');
  }
  const target = options.target ?? window;
  const handlers = options.handlers ?? {
    ping: () => 'pong',
  };
  const cancelled = new Set<string>();

  function onMessage(event: MessageEvent): void {
    if (event.origin !== options.allowedParentOrigin) return;
    if (!isIframeHandshakeMessage(event.data)) return;
    if (event.data.appId !== options.appId) return;
    if (negotiateIframeProtocolVersion(event.data.protocolVersion) === null) {
      return;
    }
    const channel = new MessageChannel();
    function onPortMessage(portEvent: MessageEvent): void {
      const request = portEvent.data as
        | IframeCapabilityCancel
        | IframeCapabilityDispose
        | IframeCapabilityRequest;
      if (!request || typeof request !== 'object') return;
      if (request.type === 'cancel') {
        cancelled.add(request.requestId);
        return;
      }
      if (request.type === 'dispose') {
        channel.port1.removeEventListener('message', onPortMessage);
        channel.port1.close();
        return;
      }
      if (request.type !== 'request') return;
      if (cancelled.has(request.requestId)) {
        cancelled.delete(request.requestId);
        return;
      }
      const reply: IframeCapabilityResponse = {
        type: 'response',
        requestId: request.requestId,
      };
      try {
        if (request.appId !== options.appId) {
          throw new Error('appId mismatch');
        }
        if (negotiateIframeProtocolVersion(request.protocolVersion) === null) {
          throw new Error('unsupported protocol version');
        }
        if (request.capability !== 'host') {
          throw new Error(`capability "${request.capability}" is not allowed`);
        }
        assertIframeMethodPayload(request.method, request.payload);
        const handler = handlers[request.method];
        if (!handler) {
          throw new Error(`method "${request.method}" is not allowed`);
        }
        reply.payload = handler(request.payload);
      } catch (error) {
        reply.error = error instanceof Error ? error.message : String(error);
      }
      if (cancelled.has(request.requestId)) {
        cancelled.delete(request.requestId);
        return;
      }
      channel.port1.postMessage(reply);
    }
    channel.port1.addEventListener('message', onPortMessage);
    channel.port1.start();
    const ack: IframeHandshakeAckMessage = {
      type: IFRAME_HANDSHAKE_ACK_TYPE,
      protocol: IFRAME_CAPABILITY_PROTOCOL,
      protocolVersion: IFRAME_CAPABILITY_PROTOCOL_VERSION,
      nonce: event.data.nonce,
    };
    (event.source as Window | null)?.postMessage(ack, event.origin, [
      channel.port2,
    ]);
  }

  target.addEventListener('message', onMessage);
  return () => target.removeEventListener('message', onMessage);
}
