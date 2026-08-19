import type { Linter } from 'eslint';

type RestrictedSyntaxSelector = {
  message: string;
  selector: string;
};

/**
 * Pages, features, editors, and UI packages must not branch on host globals.
 * Web / Electron / iframe / preload differences belong in apps boot +
 * `nebula-assembly` host adapters (`assembly-boot` collects capabilities).
 *
 * This override replaces `no-restricted-syntax` for matched files, so it
 * repeats the shared debugger/with bans from `javascript.ts` / `vue.ts`.
 */
const hostBranchSelectors: RestrictedSyntaxSelector[] = [
  {
    selector:
      "MemberExpression[object.name='window'][property.name='electron']",
    message:
      'Do not branch on window.electron in pages/features/editors. Collect host capabilities at boot and consume nebula-assembly HostAdapter.',
  },
  {
    selector:
      "MemberExpression[object.name='globalThis'][property.name='electron']",
    message:
      'Do not branch on globalThis.electron in pages/features/editors. Use nebula-assembly HostAdapter from boot.',
  },
  {
    selector: "MemberExpression[object.name='window'][property.name='api']",
    message:
      'Do not call window.api in pages/features/editors. Wire preload APIs at boot (assembly-boot) or use ConfigProvider/useConfig.',
  },
  {
    selector: "MemberExpression[object.name='window'][property.name='parent']",
    message:
      'Do not detect iframe hosts via window.parent in pages/features/editors. Use assembly host.surface / useShellHosted.',
  },
  {
    selector:
      "MemberExpression[object.name='window'][computed=true][property.value='electron']",
    message:
      'Do not branch on window["electron"] in pages/features/editors. Use nebula-assembly HostAdapter from boot.',
  },
  {
    selector:
      "MemberExpression[object.name='window'][computed=true][property.value='api']",
    message:
      'Do not call window["api"] in pages/features/editors. Wire preload APIs at boot or use ConfigProvider/useConfig.',
  },
  {
    selector: "BinaryExpression[operator='in'][left.value='electron']",
    message:
      'Do not probe the electron global in pages/features/editors. Use nebula-assembly HostAdapter from boot.',
  },
  {
    selector: "ImportDeclaration[source.value='@electron-toolkit/preload']",
    message:
      'Do not import @electron-toolkit/preload from pages/features/editors. Preload stays in apps/electron-preload and boot.',
  },
  {
    selector: "ImportSpecifier[imported.name='detectRuntimeMode']",
    message:
      'Do not import detectRuntimeMode outside apps boot. Use assembly host.surface, or getResolvedRuntimeMode() in boot-adjacent guards after bootMicroApp.',
  },
  {
    selector: "CallExpression[callee.name='detectRuntimeMode']",
    message:
      'Do not call detectRuntimeMode outside apps boot. Use assembly host.surface, or getResolvedRuntimeMode() in boot-adjacent guards after bootMicroApp.',
  },
];

const businessSourceGlobs = [
  'packages/editors/**/**',
  'packages/features/**/**',
  'packages/ui/nebula-ui/**/**',
  'packages/ui/nebula-layout/**/**',
  'packages/ui/nebula-assembly/**/**',
  'apps/sub-web/docs/src/pages/**/**',
  'apps/sub-web/docs/src/components/**/**',
  'apps/sub-web/integration/src/features/**/**',
  'apps/sub-web/integration/src/router/**/**',
  'apps/sub-web/login/src/features/**/**',
  'apps/sub-web/login/src/pages/**/**',
  'apps/sub-web/settings/src/features/**/**',
  'apps/sub-web/settings/src/pages/**/**',
  'apps/sub-web/settings/src/router/**/**',
];

const testAndDeclarationIgnores = [
  '**/__tests__/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.d.ts',
];

export async function hostBoundary(): Promise<Linter.Config[]> {
  const scriptRules: Linter.RulesRecord = {
    'no-restricted-syntax': [
      'error',
      'DebuggerStatement',
      'LabeledStatement',
      'WithStatement',
      'TSEnumDeclaration[const=true]',
      'TSExportAssignment',
      ...hostBranchSelectors,
    ],
  };
  const vueTemplateRules: Linter.RulesRecord = {
    'vue/no-restricted-syntax': [
      'error',
      'DebuggerStatement',
      'LabeledStatement',
      'WithStatement',
      ...hostBranchSelectors,
    ],
  };

  return [
    {
      files: businessSourceGlobs,
      ignores: testAndDeclarationIgnores,
      rules: scriptRules,
    },
    {
      files: businessSourceGlobs.map((glob) =>
        glob.replace('/**/**', '/**/*.vue'),
      ),
      ignores: testAndDeclarationIgnores,
      rules: vueTemplateRules,
    },
  ];
}
