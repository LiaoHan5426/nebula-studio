import type { OxlintConfig } from 'oxlint';

/**
 * Unicorn: keep the previously enforced oxlint subset.
 * Full eslint-plugin-unicorn recommended parity (Vben-style) is deferred —
 * enabling the full set surfaces hundreds of pre-existing findings and needs
 * a dedicated cleanup pass.
 */
const unicorn: OxlintConfig = {
  rules: {
    'unicorn/consistent-function-scoping': 'off',
    'unicorn/no-process-exit': 'error',
    'unicorn/no-single-promise-in-promise-methods': 'off',
    'unicorn/no-useless-spread': 'off',
    'unicorn/prefer-global-this': 'off',
    'unicorn/prefer-module': 'error',
  },
};

export { unicorn };
