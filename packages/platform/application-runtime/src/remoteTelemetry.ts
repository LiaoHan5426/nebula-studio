export const FRONTEND_TELEMETRY_PATH = '/api/system/frontend-apps/telemetry';

export const REMOTE_TELEMETRY_EVENT_TYPES = [
  'live_success',
  'live_failure',
  'lkg_used',
  'circuit_open',
  'integrity_mismatch',
  'signature_mismatch',
  'packaged_pin',
] as const;

export type RemoteTelemetryEventType =
  (typeof REMOTE_TELEMETRY_EVENT_TYPES)[number];

export interface RemoteTelemetryEvent {
  applicationId: string;
  entry?: string;
  eventType: RemoteTelemetryEventType;
  message?: string;
  version?: string;
}

export type RemoteTelemetryReporter = (event: RemoteTelemetryEvent) => void;

export function reportRemoteTelemetry(
  report: RemoteTelemetryReporter | undefined,
  event: RemoteTelemetryEvent,
): void {
  if (!report) {
    return;
  }
  try {
    report(event);
  } catch {
    // Host isolation: telemetry must never fail the Remote mount path.
  }
}

export function createFrontendTelemetryReporter(init?: {
  tenantId?: null | string;
  token?: null | string;
}): RemoteTelemetryReporter {
  return (event) => {
    try {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const token = init?.token?.trim();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const tenantId = init?.tenantId?.trim();
      if (tenantId) {
        headers.set('X-Tenant-Id', tenantId);
      }
      void fetch(FRONTEND_TELEMETRY_PATH, {
        body: JSON.stringify(event),
        headers,
        keepalive: true,
        method: 'POST',
      }).catch(() => undefined);
    } catch {
      // ignore
    }
  };
}
