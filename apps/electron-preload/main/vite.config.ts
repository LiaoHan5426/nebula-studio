import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    format: ['cjs'],
    // minify: true,
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
  cache: false,
});
