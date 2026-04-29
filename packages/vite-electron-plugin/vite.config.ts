import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    deps: {
      neverBundle: [
        '@oxc-project/types',
        '@types/chai',
        '@types/deep-eql',
        '@voidzero-dev/vite-plus-core',
        '@voidzero-dev/vite-plus-test',
        'assertion-error',
        'esbuild',
        'happy-dom',
        'oxfmt',
        'oxlint',
        'vite-plus',
      ],
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
