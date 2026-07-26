import type { AccessRequestDraft, ResourceSummaryViewModel } from './types';

const FAVORITES_KEY = 'nebula.portal.resource-favorites';
const RECENTS_KEY = 'nebula.portal.resource-recents';
const DRAFT_PREFIX = 'nebula.portal.access-draft.';

function readIds(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]') as unknown;
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export function favoriteResourceIds(): string[] {
  return readIds(FAVORITES_KEY);
}

export function toggleFavoriteResource(id: string): string[] {
  const ids = favoriteResourceIds();
  const next = ids.includes(id)
    ? ids.filter((item) => item !== id)
    : [id, ...ids];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function recentResourceIds(): string[] {
  return readIds(RECENTS_KEY);
}

export function recordRecentResource(resource: ResourceSummaryViewModel): void {
  const next = [
    resource.id,
    ...recentResourceIds().filter((id) => id !== resource.id),
  ].slice(0, 8);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
}

export function readAccessDraft(
  resourceId: string,
): Partial<AccessRequestDraft> {
  try {
    return JSON.parse(
      localStorage.getItem(`${DRAFT_PREFIX}${resourceId}`) || '{}',
    ) as Partial<AccessRequestDraft>;
  } catch {
    return {};
  }
}

export function writeAccessDraft(
  resourceId: string,
  draft: AccessRequestDraft,
): void {
  localStorage.setItem(`${DRAFT_PREFIX}${resourceId}`, JSON.stringify(draft));
}

export function clearAccessDraft(resourceId: string): void {
  localStorage.removeItem(`${DRAFT_PREFIX}${resourceId}`);
}

export function trackPortalEvent(
  name: string,
  detail: Record<string, unknown> = {},
): void {
  window.dispatchEvent(
    new CustomEvent('nebula:portal-event', { detail: { name, ...detail } }),
  );
}
