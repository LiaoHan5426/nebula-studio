const MAX_RENDERER_CHUNK_NAME_LENGTH = 40;

export function sanitizeRendererChunkName(name: string): string {
  const normalized = name.replaceAll('\\', '/');
  if (
    normalized.includes('virtual_mf') ||
    normalized.includes('__mfe_internal__') ||
    normalized.includes('loadShare')
  ) {
    return 'mf-share';
  }
  if (normalized.length <= MAX_RENDERER_CHUNK_NAME_LENGTH) {
    return normalized;
  }
  return normalized
    .slice(0, MAX_RENDERER_CHUNK_NAME_LENGTH)
    .replace(/-+$/u, '');
}

/** Keep Vite's asset table on one line: MF virtual ids must not set column width. */
export function nebulaRendererChunkFileNames(chunk: { name: string }): string {
  return `assets/${sanitizeRendererChunkName(chunk.name)}-[hash].js`;
}
