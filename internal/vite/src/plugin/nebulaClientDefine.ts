import type { Plugin } from 'vite';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleDefineValue(value: unknown): string {
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/**
 * Vite 8：client **serve** 不再对裸 `define` 标识符做静态替换（只注入到
 * `globalThis`），ESM 严格模式下访问 `__NEBULA_*__` 会 `ReferenceError`。
 *
 * 本插件在 serve 的 client transform 中补回标识符替换；`build` 仍由 Vite /
 * rolldown 的 `vite:define` 处理，此处跳过以免重复。
 */
export function nebulaClientDefinePlugin(): Plugin {
  return {
    name: 'nebula-client-define',
    enforce: 'pre',
    transform(code) {
      const env = this.environment;
      if (!env || env.config.command === 'build') return;
      if (env.config.consumer !== 'client') return;

      const define = env.config.define;
      if (!define) return;

      let out = code;
      let changed = false;
      for (const key of Object.keys(define)) {
        // 跳过 `process.env.*` / `import.meta.env.*` 等，交由 Vite 内置处理
        if (key.includes('.')) continue;
        if (!out.includes(key)) continue;
        const replacement = handleDefineValue(define[key]);
        const next = out.replace(
          new RegExp(`\\b${escapeRegex(key)}\\b`, 'g'),
          () => replacement,
        );
        if (next !== out) {
          out = next;
          changed = true;
        }
      }
      return changed ? { code: out, map: null } : undefined;
    },
  };
}
