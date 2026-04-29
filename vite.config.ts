import { defineConfig } from 'vite-plus';

import { oxfmtConfig } from '@nebula-studio-internal/oxfmt';
import { oxlintConfig } from '@nebula-studio-internal/oxlint';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    ...oxfmtConfig,
  },
  lint: {
    ...oxlintConfig,
  },
  run: {
    cache: true,
  },
});
