/**
 * Catalog resource ids are `kind:sourceId` (colon). Encode the id as a single
 * path segment so hash history and Vue Router params do not treat `:` as a
 * new parameter delimiter.
 */
export function catalogDetailPath(resourceId: string): string {
  return `/catalog/${encodeURIComponent(resourceId)}`;
}

export function catalogApplyPath(resourceId: string): string {
  return `/catalog/${encodeURIComponent(resourceId)}/apply`;
}
