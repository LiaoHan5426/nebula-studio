import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    deps: {
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
