import type { Linter } from 'eslint';

import { interopDefault } from '../util';

export async function node(): Promise<Linter.Config[]> {
  const pluginNode = await interopDefault(import('eslint-plugin-n'));

  return [
    {
      plugins: {
        n: pluginNode,
      },
      rules: {
        'n/handle-callback-err': ['error', '^(err|error)$'],
        'n/no-deprecated-api': 'error',
        'n/no-extraneous-import': [
          'error',
          {
            allowModules: [
              'tsdown',
              'unplugin-vue',
              '@nebula-studio-internal/build-kit',
              'vitest',
              'vite',
              '@vitejs/plugin-vue',
              '@vitejs/plugin-vue-jsx',
              '@vue/test-utils',
              '@playwright/test',
              'electron',
              'vue-router',
              'vxe-pc-ui',
              'vxe-table',
              'vue',
            ],
          },
        ],
        'n/no-unsupported-features/es-syntax': [
          'error',
          {
            ignores: [],
            version: '>=22.18.0',
          },
        ],
        'n/prefer-global/buffer': ['error', 'never'],
        'n/prefer-global/process': ['error', 'never'],
        'n/process-exit-as-throw': 'error',
      },
    },
    {
      files: [
        '**/__tests__/**/*.?([cm])[jt]s?(x)',
        '**/*.spec.?([cm])[jt]s?(x)',
        '**/*.test.?([cm])[jt]s?(x)',
        '**/*.bench.?([cm])[jt]s?(x)',
        '**/*.benchmark.?([cm])[jt]s?(x)',
      ],
      rules: {
        'n/prefer-global/process': 'off',
      },
    },
    {
      files: ['apps/backend-mock/**/**', 'docs/**/**'],
      rules: {
        'n/no-extraneous-import': 'off',
        'n/prefer-global/buffer': 'off',
        'n/prefer-global/process': 'off',
      },
    },
    {
      // Electron / Vite / e2e 常用 process/Buffer 全局；preload 无独立 package.json
      files: [
        'apps/electron/**/**',
        'apps/electron-preload/**/**',
        'apps/web/**/**',
        'e2e/**/**',
        '**/*.config.?([cm])[jt]s?(x)',
        '**/vite.config.?([cm])[jt]s?(x)',
        '**/vitest.config.?([cm])[jt]s?(x)',
        '**/electron.vite.config.?([cm])[jt]s?(x)',
      ],
      rules: {
        'n/no-extraneous-import': 'off',
        'n/prefer-global/buffer': 'off',
        'n/prefer-global/process': 'off',
      },
    },
    {
      files: ['**/**/playwright.config.ts'],
      rules: {
        'n/prefer-global/buffer': 'off',
        'n/prefer-global/process': 'off',
      },
    },
    {
      files: [
        'scripts/**/*.?([cm])[jt]s?(x)',
        'internal/**/*.?([cm])[jt]s?(x)',
        'tools/**/*.?([cm])[jt]s?(x)',
        'packages/**/*.?([cm])[jt]s?(x)',
      ],
      rules: {
        'n/prefer-global/process': 'off',
      },
    },
    {
      // 类型包 / 桥接包：ambient 或 peer 依赖，不强制逐项写入 package.json
      files: ['packages/types/**/**', 'packages/core/electron-shared/**/**'],
      rules: {
        'n/no-extraneous-import': 'off',
      },
    },
  ];
}
