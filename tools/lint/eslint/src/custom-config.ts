import type { Linter } from 'eslint';

const restrictedImportIgnores = [
  '**/*.config.ts',
  '**/*.config.mts',
  '**/vite.config.ts',
  '**/electron.vite.config.ts',
];

const customConfig: Linter.Config[] = [
  // UI / editor 组件库：可选 props 常无默认值；测试文件允许多组件
  {
    files: [
      'packages/ui/**/**',
      'packages/editors/**/**',
      'apps/sub-web/docs/**/**',
    ],
    rules: {
      'vue/require-default-prop': 'off',
      'vue/one-component-per-file': 'off',
    },
  },
  {
    files: [
      'apps/**/**',
      'packages/effects/**/**',
      'packages/utils/**/**',
      'packages/types/**/**',
      'packages/locales/**/**',
    ],
    ignores: restrictedImportIgnores,
    rules: {
      'perfectionist/sort-interfaces': 'off',
    },
  },

  // ==================== §3.8.3 表 A — 跨包依赖禁止矩阵 ====================

  // packages/contracts 不能引用 editors / features / renderer / apps
  {
    files: ['packages/contracts/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/*'],
              message: 'contracts 禁止引用 renderer 包',
            },
            {
              group: ['apps/*'],
              message: 'contracts 禁止引用 apps',
            },
            {
              group: [
                '@nebula-studio/nebula-dag-editor',
                '@nebula-studio/nebula-flow-editor',
                '@nebula-studio/nebula-integration-panel',
                '@nebula-studio/nebula-low-render',
              ],
              message: 'contracts 禁止引用 editors 包',
            },
          ],
        },
      ],
    },
  },

  // packages/ui 不能引用 renderer / integration contracts / apps
  {
    files: ['packages/ui/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/*'],
              message: 'packages/ui 禁止引用 renderer 包',
            },
            {
              group: ['@nebula-studio/contracts/integration'],
              message: 'packages/ui 禁止引用 contracts/integration',
            },
            {
              group: ['apps/*'],
              message: 'packages/ui 禁止引用 apps',
            },
            {
              group: [
                '@nebula-studio/nebula-code-editor',
                '@nebula-studio/nebula-dag-editor',
                '@nebula-studio/nebula-flow-editor',
                '@nebula-studio/nebula-integration-panel',
                '@nebula-studio/nebula-low-render',
                '@codemirror/*',
                'codemirror',
                'monaco-editor',
                'monaco-editor-vue3',
                '@tiptap/*',
              ],
              message: 'packages/ui 禁止引用编辑器包或编辑器运行时',
            },
          ],
        },
      ],
    },
  },

  // packages/editors 不能引用 renderer / apps
  {
    files: ['packages/editors/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/*'],
              message: 'packages/editors 禁止引用 renderer 包',
            },
            {
              group: ['apps/*'],
              message: 'packages/editors 禁止引用 apps',
            },
          ],
        },
      ],
    },
  },

  // packages/features 不能引用 renderer / apps
  {
    files: ['packages/features/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/*'],
              message: 'packages/features 禁止引用 renderer 包',
            },
            {
              group: ['apps/*'],
              message: 'packages/features 禁止引用 apps',
            },
          ],
        },
      ],
    },
  },

  // renderer 隔离：frontend 不能引用 integration / settings
  {
    files: ['apps/sub-web/frontend/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/integration'],
              message: 'frontend 禁止引用 integration renderer',
            },
            {
              group: ['@nebula-studio-renderer/settings'],
              message: 'frontend 禁止引用 settings renderer',
            },
          ],
        },
      ],
    },
  },

  // renderer 隔离：integration 不能引用 settings / frontend(main)
  {
    files: ['apps/sub-web/integration/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/settings'],
              message: 'integration 禁止引用 settings renderer',
            },
            {
              group: ['@nebula-studio-renderer/main'],
              message: 'integration 禁止引用 frontend(main) renderer',
            },
          ],
        },
      ],
    },
  },

  // renderer 隔离：settings 不能引用 integration / contracts/integration
  {
    files: ['apps/sub-web/settings/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/integration'],
              message: 'settings 禁止引用 integration renderer',
            },
            {
              group: ['@nebula-studio/contracts/integration'],
              message: 'settings 禁止引用 contracts/integration',
            },
          ],
        },
      ],
    },
  },

  // renderer 隔离：login 不能引用 integration / contracts/integration
  {
    files: ['apps/sub-web/login/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/integration'],
              message: 'login 禁止引用 integration renderer',
            },
            {
              group: ['@nebula-studio/contracts/integration'],
              message: 'login 禁止引用 contracts/integration',
            },
          ],
        },
      ],
    },
  },

  // electron main 不能引用 Vue SFC 和 packages/ui
  {
    files: ['apps/electron/src/main/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/*.vue'],
              message: 'electron main 禁止引用 Vue SFC',
            },
            {
              group: [
                '@nebula-studio/nebula-ui',
                '@nebula-studio/nebula-assembly',
              ],
              message: 'electron main 禁止引用 packages/ui',
            },
          ],
        },
      ],
    },
  },

  // internal / tools 不能引用 renderer（类型解析 devDep 除外）
  {
    files: ['internal/**/**', 'tools/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio-renderer/*'],
              message: 'internal/tools 禁止引用 renderer 包（devDep 类型除外）',
            },
          ],
        },
      ],
    },
  },

  // 任意 packages/ 不能通过相对路径引用 apps/
  {
    files: ['packages/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../apps/*', '../../apps/*'],
              message: 'packages 禁止通过相对路径引用 apps',
            },
          ],
        },
      ],
    },
  },

  // Must follow the packages/** import matrix: later configs replace the rule.
  {
    files: ['packages/core/**/**'],
    ignores: restrictedImportIgnores,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nebula-studio/nebula-assembly'],
              message:
                'packages/core 禁止引用 nebula-assembly；core 只保留协议，装配层由 apps boot 接入',
            },
            {
              group: ['@nebula-studio-renderer/*'],
              message: 'packages/core 禁止引用 renderer 包',
            },
            {
              group: ['apps/sub-web/*'],
              message: 'packages/core 禁止引用 sub-web 应用',
            },
            {
              group: ['apps/web/**'],
              message: 'packages/core 禁止引用 web 业务页',
            },
            {
              group: ['../../../apps/*', '../../apps/*'],
              message: 'packages 禁止通过相对路径引用 apps',
            },
          ],
        },
      ],
    },
  },

  // 后端模拟代码，不需要太多规则
  {
    files: ['apps/backend-mock/**/**', 'docs/**/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/**/playwright.config.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: [
      'internal/**/**',
      'scripts/**/**',
      'apps/electron/**/**',
      'packages/editors/code-editor/**/**',
    ],
    rules: {
      'no-console': 'off',
    },
  },
];

export { customConfig };
