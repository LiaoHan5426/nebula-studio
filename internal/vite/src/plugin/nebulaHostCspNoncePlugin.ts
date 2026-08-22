import type { Plugin } from 'vite';

import {
  applyProductionScriptNonceToHtml,
  NEBULA_CSP_NONCE_PLACEHOLDER,
} from './hostCspNonce.ts';

/**
 * Production Host CSP: Vite `html.cspNonce` plus drop `script-src 'unsafe-inline'`.
 * Dev keeps the HTML source policy (Web still needs unsafe-inline for HMR).
 * The placeholder must be replaced per HTTP response when a server is in front;
 * packaged Electron uses the build-time placeholder.
 */
export function nebulaHostCspNoncePlugin(): Plugin {
  let command: 'build' | 'serve' = 'serve';
  return {
    name: 'nebula-host-csp-nonce',
    config(_userConfig, env) {
      command = env.command;
      if (env.command !== 'build') {
        return;
      }
      return {
        html: {
          cspNonce: NEBULA_CSP_NONCE_PLACEHOLDER,
        },
      };
    },
    transformIndexHtml(html) {
      if (command !== 'build') {
        return html;
      }
      return applyProductionScriptNonceToHtml(html);
    },
  };
}
