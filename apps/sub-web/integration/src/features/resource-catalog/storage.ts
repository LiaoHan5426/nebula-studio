export function trackPortalEvent(
  name: string,
  detail: Record<string, unknown> = {},
): void {
  window.dispatchEvent(
    new CustomEvent('nebula:portal-event', { detail: { name, ...detail } }),
  );
}
