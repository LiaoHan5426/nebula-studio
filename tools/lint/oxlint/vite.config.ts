import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    dts: true,
    exports: true,
    format: 'esm',
    outExtensions: () => ({
      dts: '.d.ts',
    }),
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
