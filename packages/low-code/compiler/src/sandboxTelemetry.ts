export interface SandboxTelemetryEvent {
  at: number;
  kind: 'circuit-open';
  nodeId: string;
}

const events: SandboxTelemetryEvent[] = [];
const MAX_EVENTS = 256;

export function recordSandboxCircuitOpen(nodeId: string): void {
  events.push({ kind: 'circuit-open', nodeId, at: Date.now() });
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
}

export function getSandboxTelemetrySnapshot(): SandboxTelemetryEvent[] {
  return events.slice();
}

export function resetSandboxTelemetry(): void {
  events.length = 0;
}
