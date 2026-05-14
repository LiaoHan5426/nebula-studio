import { defineConfig } from 'vite-plus';

import { defineConfig as fmtDefineConfig } from '@nebula-studio-internal/oxfmt';
import { oxlintConfig } from '@nebula-studio-internal/oxlint';

export default defineConfig({
  staged: {
    '*': 'vp check --fix -- --threads 2',
  },
  fmt: {
    ...fmtDefineConfig({
      ignorePatterns: [
        'dist',
        'dev-dist',
        '.local',
        '.claude',
        '.agent',
        '.agents',
        '.codex',
        '.output.js',
        'node_modules',
        '.nvmrc',
        'coverage',
        'CODEOWNERS',
        '.nitro',
        '.output',
        '**/*.svg',
        '**/*.sh',
        'public',
        '.npmrc',
        '*-lock.yaml',
        'skills-lock.json',
      ],
    }),
  },
  lint: {
    ...oxlintConfig,
  },
  run: {
    cache: {
      // `vite dev` 等脚本不可缓存，否则 `vp run web#dev` 会回放旧输出并立刻退出
      scripts: false,
      tasks: true,
    },
  },
});
