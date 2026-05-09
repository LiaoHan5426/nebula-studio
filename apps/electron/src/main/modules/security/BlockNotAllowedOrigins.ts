import { URL } from 'node:url';
import type { WebContents } from 'electron';
import { is } from '@electron-toolkit/utils';
import { AbstractSecurityRule } from './AbstractSecurityRule';

/**
 * Block navigation to origins not on the allowlist.
 * https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
 */
export class BlockNotAllowedOrigins extends AbstractSecurityRule {
  readonly #allowedOrigins: Set<string>;

  constructor(allowedOrigins: Set<string> = new Set()) {
    super();
    this.#allowedOrigins = structuredClone(allowedOrigins);
  }

  applyRule(contents: WebContents): void {
    contents.on('will-navigate', (event, url) => {
      const { origin } = new URL(url);
      if (this.#allowedOrigins.has(origin)) {
        return;
      }

      event.preventDefault();
      if (is.dev) {
        console.warn(`Blocked navigating to disallowed origin: ${origin}`);
      }
    });
  }
}

export function allowInternalOrigins(
  ...args: ConstructorParameters<typeof BlockNotAllowedOrigins>
): BlockNotAllowedOrigins {
  return new BlockNotAllowedOrigins(...args);
}
