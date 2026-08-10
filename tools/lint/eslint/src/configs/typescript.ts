import type { Linter } from 'eslint';

import { interopDefault } from '../util';

/**
 * TypeScript rules live in oxlint (typescript plugin).
 * Keep only the TS parser so other ESLint plugins can parse TS/TSX/Vue SFCs.
 * Without type-aware rules, parserOptions.project is omitted for faster lint.
 *
 * After removing @typescript-eslint plugin, unused-imports/no-unused-vars falls
 * back to the core implementation and mis-flags TS type-only params — turn it
 * off for TS/TSX/Vue and let oxlint own unused vars.
 */
export async function typescript(): Promise<Linter.Config[]> {
  const parserTs = await interopDefault(import('@typescript-eslint/parser'));

  return [
    {
      files: ['**/*.?([cm])[jt]s?(x)'],
      languageOptions: {
        parser: parserTs,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 'latest',
          extraFileExtensions: ['.vue'],
          jsxPragma: 'React',
          sourceType: 'module',
        },
      },
      rules: {
        'unused-imports/no-unused-vars': 'off',
      },
    },
    {
      files: ['**/*.vue'],
      rules: {
        'unused-imports/no-unused-vars': 'off',
      },
    },
  ];
}
