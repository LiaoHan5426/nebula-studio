import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    dts: true,
    exports: true,
    deps: {
      neverBundle: ['picocolors'],
      onlyBundle: ['@commitlint/types', 'conventional-commits-parser'],
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
