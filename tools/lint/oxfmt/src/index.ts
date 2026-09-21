import { defineConfig as defineOxfmtConfig } from 'oxfmt';

type OxfmtConfig = Parameters<typeof defineOxfmtConfig>[0];

const oxfmtConfig: OxfmtConfig = defineOxfmtConfig({
  printWidth: 80,
  proseWrap: 'never',
  semi: true,
  singleQuote: true,
  sortPackageJson: false,
  trailingComma: 'all',
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      options: {
        // Default `css` treats inline tags as whitespace-sensitive and wraps as
        // `</span\n>` / `<span\n>`, which fights Vue/ESLint and looks broken on save.
        htmlWhitespaceSensitivity: 'ignore',
        // Keep `>` on its own line for multiline tags (matches vue/html-closing-bracket-newline).
        bracketSameLine: false,
      },
    },
    {
      files: [
        '*.json',
        '*.json5',
        '*.jsonc',
        '*.code-workspace',
        '**/*.json',
        '**/*.json5',
        '**/*.jsonc',
        '**/*.code-workspace',
      ],
      options: {
        trailingComma: 'none',
      },
    },
  ],
});

function defineConfig(config: OxfmtConfig = {}): OxfmtConfig {
  return defineOxfmtConfig({
    ...oxfmtConfig,
    ...config,
  });
}

export { defineConfig, oxfmtConfig };
export type { OxfmtConfig };
