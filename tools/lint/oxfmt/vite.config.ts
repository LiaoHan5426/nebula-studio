import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    deps: {
      neverBundle: ['oxfmt'],
      onlyBundle: false,
    },
    dts: true,
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
