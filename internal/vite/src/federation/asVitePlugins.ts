import type { Plugin } from 'vite';

/** `@module-federation/vite` currently types `federation()` as a plugin array. */
export function asVitePlugins(value: unknown): Plugin[] {
  if (Array.isArray(value)) {
    return value as Plugin[];
  }
  if (value && typeof value === 'object') {
    return [value as Plugin];
  }
  return [];
}
