import type { Linter } from 'eslint';

/**
 * New API modules must not declare handwritten request/response DTO interfaces.
 * Import from `@nebula-studio/contracts/*` instead.
 */
export const contractBoundaryConfig: Linter.Config = {
  files: [
    'apps/sub-web/**/src/shared/api/**/*.ts',
    'apps/sub-web/**/src/features/**/api.ts',
  ],
  ignores: [
    '**/*.config.ts',
    '**/client.ts',
    'apps/sub-web/login/**',
    'apps/sub-web/integration/src/shared/api/integration.ts',
    'apps/sub-web/integration/src/features/governance/**',
    'apps/sub-web/integration/src/features/monitor/**',
  ],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'ExportNamedDeclaration > TSInterfaceDeclaration[id.name=/^(.*Request|.*Response|.*Record|.*Dto)$/]',
        message:
          'Handwritten API DTO interfaces are forbidden. Import from @nebula-studio/contracts/* or add the type to contracts with a generated mapper.',
      },
    ],
  },
};
