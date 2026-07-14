import type { OxlintConfig } from 'oxlint';

const overrides: OxlintConfig = {
  overrides: [
    {
      files: ['*.d.ts', '**/*.d.ts'],
      rules: {
        'import/no-unassigned-import': 'off',
        'typescript/triple-slash-reference': 'off',
      },
    },
    {
      files: [
        '**/__tests__/**/*.js',
        '**/__tests__/**/*.cjs',
        '**/__tests__/**/*.mjs',
        '**/__tests__/**/*.jsx',
        '**/__tests__/**/*.ts',
        '**/__tests__/**/*.cts',
        '**/__tests__/**/*.mts',
        '**/__tests__/**/*.tsx',
        '**/*.spec.js',
        '**/*.spec.cjs',
        '**/*.spec.mjs',
        '**/*.spec.jsx',
        '**/*.spec.ts',
        '**/*.spec.cts',
        '**/*.spec.mts',
        '**/*.spec.tsx',
        '**/*.test.js',
        '**/*.test.cjs',
        '**/*.test.mjs',
        '**/*.test.jsx',
        '**/*.test.ts',
        '**/*.test.cts',
        '**/*.test.mts',
        '**/*.test.tsx',
        '**/*.bench.js',
        '**/*.bench.cjs',
        '**/*.bench.mjs',
        '**/*.bench.jsx',
        '**/*.bench.ts',
        '**/*.bench.cts',
        '**/*.bench.mts',
        '**/*.bench.tsx',
        '**/*.benchmark.js',
        '**/*.benchmark.cjs',
        '**/*.benchmark.mjs',
        '**/*.benchmark.jsx',
        '**/*.benchmark.ts',
        '**/*.benchmark.cts',
        '**/*.benchmark.mts',
        '**/*.benchmark.tsx',
      ],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: [
        '**/electron.build.js',
        '**/electron.build.ts',
        '**/electron.build.mjs',
        '**/electron.build.mts',
        '**/sync-app-config.ts',
      ],
      rules: {
        'no-template-curly-in-string': 'off',
      },
    },
    {
      files: ['apps/electron-preload/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['packages/core/auth/src/strategies/**/*'],
      rules: {
        // Legacy private fields (_foo) on auth strategy classes; prefer #foo in new code.
        'no-underscore-dangle': [
          'warn',
          {
            allowAfterThis: true,
            enforceInClassFields: false,
          },
        ],
      },
    },
    {
      files: ['packages/core/auth/src/AuthBootstrap.ts'],
      rules: {
        'no-underscore-dangle': [
          'warn',
          {
            allow: ['_exhaustive'],
          },
        ],
        'typescript/no-extraneous-class': 'off',
      },
    },
    {
      files: ['apps/sub-web/frontend/src/platform/integratedApps.ts'],
      rules: {
        'no-underscore-dangle': [
          'warn',
          {
            allow: ['_embeddedIds', '_catalog'],
          },
        ],
      },
    },
    {
      files: ['packages/core/runtime/src/bootMicroApp.ts'],
      rules: {
        'no-underscore-dangle': [
          'warn',
          {
            allow: ['__resetActiveMicroAppHandleForTests'],
          },
        ],
      },
    },
    {
      files: ['apps/electron/**/*'],
      rules: {
        'no-console': 'off',
        'import/no-self-import': 'off',
        'unicorn/prefer-module': 'off',
      },
    },
    {
      files: ['packages/vite-electron-plugin/**/*'],
      rules: {
        'no-process-exit': 'off',
      },
    },
    {
      files: ['packages/capacitor-electron/**/*'],
      rules: {
        'no-useless-return': 'off',
      },
    },
    {
      files: [
        'scripts/**/*.js',
        'scripts/**/*.cjs',
        'scripts/**/*.mjs',
        'scripts/**/*.jsx',
        'scripts/**/*.ts',
        'scripts/**/*.cts',
        'scripts/**/*.mts',
        'scripts/**/*.tsx',
        'internal/**/*.js',
        'internal/**/*.cjs',
        'internal/**/*.mjs',
        'internal/**/*.jsx',
        'internal/**/*.ts',
        'internal/**/*.cts',
        'internal/**/*.mts',
        'internal/**/*.tsx',
      ],
      rules: {
        'no-console': 'off',
        'unicorn/no-process-exit': 'off',
      },
    },
  ],
};

export { overrides };
