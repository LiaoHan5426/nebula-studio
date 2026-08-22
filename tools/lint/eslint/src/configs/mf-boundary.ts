import type { Linter } from 'eslint';

/**
 * Module Federation / Host-Remote dependency graph.
 * Import and package.json bans that used to live in scripts/check-boundaries.mjs.
 *
 * Still script-only: required dependencies, deleted-file locks, generated
 * OpenAPI/facade, and generate-*.mjs orchestration (cannot be expressed as
 * "must import" / "file must not exist" in ESLint).
 */

const restrictedImportIgnores = [
  '**/*.config.ts',
  '**/*.config.mts',
  '**/vite.config.ts',
  '**/electron.vite.config.ts',
  '**/__tests__/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
];

const jsSyntaxBase = [
  'DebuggerStatement',
  'LabeledStatement',
  'WithStatement',
  'TSEnumDeclaration[const=true]',
  'TSExportAssignment',
] as const;

function forbidJsonDep(
  name: string,
  message: string,
  groups = 'dependencies|peerDependencies|optionalDependencies',
): { message: string; selector: string } {
  return {
    selector: `JSONProperty[key.value=/${groups}/] > JSONObjectExpression > JSONProperty[key.value='${name}']`,
    message,
  };
}

const productInternalImportBan = {
  group: [
    '@nebula-studio-internal/node',
    '@nebula-studio-internal/node/*',
    '@nebula-studio-internal/vite',
    '@nebula-studio-internal/vite/*',
  ],
  message:
    'apps/packages 运行时禁止依赖 @nebula-studio-internal/node 或 vite；构建入口用 vite.config',
};

const appShellProtocolImportBan = {
  selector:
    "ImportDeclaration[source.value='@nebula-studio/app-shell'] > ImportSpecifier[imported.name=/^(RuntimeMode|createEventBus|resolveShellEventBus|stampFederationRuntimeMode|requireRuntimeMode|getResolvedRuntimeMode|wireShellEventBus|loginWithBackendAuth)$/]",
  message:
    '协议与认证符号从 @nebula-studio/shell-protocol 或 auth-provider 直接 import，禁止经 app-shell 再导出',
};

const remoteImportPatterns = [
  productInternalImportBan,
  {
    group: ['@nebula-studio/web'],
    message: 'Remote 禁止依赖 Web Host',
  },
  {
    group: ['@nebula-studio/electron'],
    message: 'Remote 禁止依赖 Electron Host',
  },
  {
    group: ['@nebula-studio/app-shell'],
    message:
      'Remote 禁止依赖 app-shell；embed/会话用 shell-protocol 或 auth-provider',
  },
  {
    group: ['@nebula-studio-electron/electron-bridge'],
    message: 'Remote 禁止依赖 electron-bridge；经 Host capabilities 接入',
  },
  {
    group: ['@nebula-studio-renderer/main'],
    message: 'Remote 禁止依赖 frontend(main)',
  },
];

const remoteElectronPath = {
  name: 'electron',
  message: 'Remote 禁止依赖 electron 运行时包',
};

const remoteJsonDepBans = [
  forbidJsonDep('@nebula-studio/web', 'Remote must not depend on Web Host'),
  forbidJsonDep(
    '@nebula-studio/electron',
    'Remote must not depend on Electron Host',
  ),
  forbidJsonDep(
    '@nebula-studio/app-shell',
    'Remote must not depend on app-shell',
  ),
  forbidJsonDep(
    '@nebula-studio-electron/electron-bridge',
    'Remote must not depend on electron-bridge',
  ),
  forbidJsonDep('electron', 'Remote must not depend on electron'),
  forbidJsonDep(
    '@nebula-studio-renderer/main',
    'Remote must not depend on frontend(main)',
  ),
  forbidJsonDep(
    '@electron-toolkit/preload',
    'Remote production deps must not include @electron-toolkit/preload',
    'dependencies',
  ),
  forbidJsonDep(
    '@nebula-studio-internal/node',
    'Product packages must not runtime-depend on @nebula-studio-internal/node',
    'dependencies',
  ),
  forbidJsonDep(
    '@nebula-studio-internal/vite',
    'Product packages must not runtime-depend on @nebula-studio-internal/vite',
    'dependencies',
  ),
];

const hostRemoteJsonBans = [
  forbidJsonDep(
    '@nebula-studio-renderer/docs',
    'Host production deps must not include Docs Remote',
    'dependencies',
  ),
  forbidJsonDep(
    '@nebula-studio-renderer/settings',
    'Host production deps must not include Settings Remote',
    'dependencies',
  ),
  forbidJsonDep(
    '@nebula-studio-renderer/integration',
    'Host production deps must not include Integration Remote',
    'dependencies',
  ),
  forbidJsonDep(
    '@nebula-studio-internal/node',
    'Product packages must not runtime-depend on @nebula-studio-internal/node',
    'dependencies',
  ),
  forbidJsonDep(
    '@nebula-studio-internal/vite',
    'Product packages must not runtime-depend on @nebula-studio-internal/vite',
    'dependencies',
  ),
];

const platformJsonBans = [
  forbidJsonDep(
    '@nebula-studio/web',
    'platform packages must not depend on Web Host',
  ),
  forbidJsonDep(
    '@nebula-studio/electron',
    'platform packages must not depend on Electron Host',
  ),
  ...hostRemoteJsonBans.map((ban) => ({
    ...ban,
    message: ban.message.replace('Host production deps', 'platform packages'),
  })),
];

export async function mfBoundary(): Promise<Linter.Config[]> {
  return [
    {
      files: [
        'apps/**/*.ts',
        'apps/**/*.tsx',
        'packages/**/*.ts',
        'packages/**/*.tsx',
      ],
      ignores: restrictedImportIgnores,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [productInternalImportBan],
          },
        ],
        'no-restricted-syntax': [
          'error',
          ...jsSyntaxBase,
          appShellProtocolImportBan,
        ],
      },
    },
    {
      files: ['apps/sub-web/docs/**/**'],
      ignores: restrictedImportIgnores,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [remoteElectronPath],
            patterns: [
              ...remoteImportPatterns,
              {
                group: ['@nebula-studio-renderer/settings'],
                message: 'docs 禁止引用 settings renderer',
              },
              {
                group: ['@nebula-studio-renderer/integration'],
                message: 'docs 禁止引用 integration renderer',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['apps/sub-web/docs/src/federation.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [remoteElectronPath],
            patterns: [
              ...remoteImportPatterns,
              {
                group: ['@nebula-studio/shell-host', '@nebula-studio/runtime'],
                message: 'Federation 入口禁止 import shell-host / runtime',
              },
              {
                group: [
                  '@nebula-studio-renderer/login',
                  '@nebula-studio-renderer/settings',
                  '@nebula-studio-renderer/integration',
                ],
                message: 'Docs Federation 禁止引用 Login 或兄弟 Remote',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['apps/sub-web/settings/src/federation.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [remoteElectronPath],
            patterns: [
              ...remoteImportPatterns,
              {
                group: ['@nebula-studio/shell-host', '@nebula-studio/runtime'],
                message: 'Federation 入口禁止 import shell-host / runtime',
              },
              {
                group: [
                  '@nebula-studio-renderer/login',
                  '@nebula-studio-renderer/docs',
                  '@nebula-studio-renderer/integration',
                ],
                message: 'Settings Federation 禁止引用 Login 或兄弟 Remote',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['apps/sub-web/integration/src/federation.ts'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [remoteElectronPath],
            patterns: [
              ...remoteImportPatterns,
              {
                group: ['@nebula-studio/shell-host', '@nebula-studio/runtime'],
                message: 'Federation 入口禁止 import shell-host / runtime',
              },
              {
                group: [
                  '@nebula-studio-renderer/login',
                  '@nebula-studio-renderer/docs',
                  '@nebula-studio-renderer/settings',
                ],
                message: 'Integration Federation 禁止引用 Login 或兄弟 Remote',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/platform/shell-protocol/**/**'],
      ignores: restrictedImportIgnores,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['vue', 'vue-router'],
                message: 'shell-protocol 必须保持无 Vue',
              },
              {
                group: ['electron', '@nebula-studio-electron/electron-bridge'],
                message: 'shell-protocol 必须保持无 Electron',
              },
              {
                group: [
                  '@nebula-studio/app-shell',
                  '@nebula-studio/auth-provider',
                  '@nebula-studio/web',
                  '@nebula-studio/electron',
                ],
                message: 'shell-protocol 禁止依赖宿主实现包',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/platform/**/**'],
      ignores: [
        ...restrictedImportIgnores,
        'packages/platform/shell-protocol/**',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@nebula-studio/web', '@nebula-studio/electron'],
                message: 'platform 禁止依赖 Host 应用包',
              },
              {
                group: [
                  '@nebula-studio-renderer/docs',
                  '@nebula-studio-renderer/settings',
                  '@nebula-studio-renderer/integration',
                ],
                message: 'platform 禁止依赖 Remote renderer',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/ui/nebula-layout/**/**'],
      ignores: restrictedImportIgnores,
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@nebula-studio/app-shell'],
                message:
                  'nebula-layout 禁止依赖 app-shell；使用 shell-protocol',
              },
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
    {
      files: ['packages/core/runtime/src/bootMicroApp.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...jsSyntaxBase,
          {
            selector: 'CallExpression[callee.name="installWebPresentation"]',
            message: 'bootMicroApp must not call installWebPresentation',
          },
        ],
      },
    },
    {
      files: ['packages/core/app-shell/src/**/*.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...jsSyntaxBase,
          {
            selector: 'Identifier[name="createWebShellHostBridge"]',
            message:
              'app-shell must not call createWebShellHostBridge; install lives in shell-host',
          },
          {
            selector: 'Identifier[name="loginWithBackendAuth"]',
            message: 'app-shell must not re-export auth-provider login helpers',
          },
        ],
      },
    },
    {
      files: ['packages/platform/shell-host/src/web/installWebPresentation.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...jsSyntaxBase,
          {
            selector:
              'AssignmentExpression[left.object.name="g"][left.property.name="electron"]',
            message:
              'installWebPresentation must not assign a fake window.electron',
          },
          {
            selector:
              'AssignmentExpression[left.object.name="window"][left.property.name="electron"]',
            message:
              'installWebPresentation must not assign a fake window.electron',
          },
        ],
      },
    },
    {
      files: [
        'apps/electron/src/main/index.ts',
        'packages/platform/application-runtime/src/frontendRuntime.ts',
      ],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...jsSyntaxBase,
          {
            selector: 'Literal[value=/localhost:517/]',
            message:
              'Use GENERATED_STANDALONE_APPS / GENERATED_FEDERATION_DEV_ENTRIES, not hardcoded localhost:517x',
          },
          {
            selector: 'TemplateElement[value.raw=/localhost:517/]',
            message:
              'Use GENERATED_STANDALONE_APPS / GENERATED_FEDERATION_DEV_ENTRIES, not hardcoded localhost:517x',
          },
        ],
      },
    },
    {
      files: ['apps/**/package.json', 'packages/**/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep(
            '@nebula-studio-internal/node',
            'Product packages must not runtime-depend on @nebula-studio-internal/node',
            'dependencies',
          ),
          forbidJsonDep(
            '@nebula-studio-internal/vite',
            'Product packages must not runtime-depend on @nebula-studio-internal/vite',
            'dependencies',
          ),
        ],
      },
    },
    {
      files: [
        'apps/sub-web/docs/package.json',
        'apps/sub-web/settings/package.json',
        'apps/sub-web/integration/package.json',
      ],
      rules: {
        'no-restricted-syntax': ['error', ...remoteJsonDepBans],
      },
    },
    {
      files: ['apps/web/package.json', 'apps/electron/package.json'],
      rules: {
        'no-restricted-syntax': ['error', ...hostRemoteJsonBans],
      },
    },
    {
      files: ['apps/electron/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          ...hostRemoteJsonBans,
          forbidJsonDep(
            '@nebula-studio-internal/node',
            'Electron production deps must not include @nebula-studio-internal/node',
            'dependencies',
          ),
        ],
      },
    },
    {
      files: ['packages/platform/**/package.json'],
      rules: {
        'no-restricted-syntax': ['error', ...platformJsonBans],
      },
    },
    {
      files: ['packages/platform/shell-protocol/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep('vue', 'shell-protocol must not depend on vue'),
          forbidJsonDep(
            'vue-router',
            'shell-protocol must not depend on vue-router',
          ),
          forbidJsonDep(
            'electron',
            'shell-protocol must not depend on electron',
          ),
          forbidJsonDep(
            '@nebula-studio/app-shell',
            'shell-protocol must not depend on app-shell',
          ),
          forbidJsonDep(
            '@nebula-studio/auth-provider',
            'shell-protocol must not depend on auth-provider',
          ),
          forbidJsonDep(
            '@nebula-studio-electron/electron-bridge',
            'shell-protocol must not depend on electron-bridge',
          ),
          forbidJsonDep(
            '@nebula-studio/web',
            'shell-protocol must not depend on Web Host',
          ),
          forbidJsonDep(
            '@nebula-studio/electron',
            'shell-protocol must not depend on Electron Host',
          ),
        ],
      },
    },
    {
      files: ['packages/ui/nebula-layout/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep(
            '@nebula-studio/app-shell',
            'nebula-layout must not depend on app-shell',
          ),
        ],
      },
    },
    {
      files: ['packages/core/auth/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep(
            '@nebula-studio/app-shell',
            '@nebula-studio/auth must not depend on app-shell',
          ),
        ],
      },
    },
    {
      files: ['packages/core/runtime/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep(
            '@nebula-studio/app-shell',
            'runtime must not depend on app-shell',
          ),
        ],
      },
    },
    {
      files: ['packages/core/app-shell/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep(
            '@nebula-studio/shell-protocol',
            'app-shell must not depend on shell-protocol; callers import it directly',
          ),
          forbidJsonDep(
            '@nebula-studio/auth-provider',
            'app-shell must not depend on auth-provider; callers import it directly',
          ),
          forbidJsonDep(
            '@nebula-studio/shell-host',
            'app-shell must not depend on shell-host (avoids a cycle)',
          ),
          forbidJsonDep(
            '@nebula-studio/contracts',
            'app-shell must not depend on contracts; window artifacts are generated locally',
          ),
        ],
      },
    },
    {
      files: ['packages/ui/nebula-ui/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep(
            'monaco-editor',
            'nebula-ui must not leak editor runtime',
          ),
          forbidJsonDep(
            'monaco-editor-vue3',
            'nebula-ui must not leak editor runtime',
          ),
          forbidJsonDep('codemirror', 'nebula-ui must not leak editor runtime'),
          {
            selector:
              'JSONProperty[key.value=/^(dependencies|peerDependencies|optionalDependencies)$/] > JSONObjectExpression > JSONProperty[key.value=/^(@codemirror\\/|@tiptap\\/|@nebula-studio\\/nebula-.*editor$)/]',
            message: 'nebula-ui must not depend on editor packages',
          },
        ],
      },
    },
    {
      files: ['packages/contracts/package.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          forbidJsonDep('vue', 'contracts must not depend on vue'),
          forbidJsonDep(
            'vue-router',
            'contracts must not depend on vue-router',
          ),
          forbidJsonDep(
            '@nebula-studio/runtime',
            'contracts must not depend on runtime',
          ),
          forbidJsonDep(
            '@nebula-studio/app-shell',
            'contracts must not depend on app-shell',
          ),
        ],
      },
    },
    {
      files: ['configs/windows.json'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: "JSONProperty[key.value='displayOrder']",
            message:
              'windows.json must not carry displayOrder; use registry sortOrder',
          },
          {
            selector:
              "JSONProperty[key.value='windows'] > JSONObjectExpression > JSONProperty > JSONObjectExpression > JSONProperty[key.value=/^(label|description|category|helpKey|searchKeywords|roles|returnTo|iconSvg|defaultEnabled|integratable|requiresAuth)$/]",
            message:
              'windows.json window entries must not include product business fields',
          },
        ],
      },
    },
  ];
}
