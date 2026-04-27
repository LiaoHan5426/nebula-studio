import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
  plugins: [vue()],
  pack: {
    entry: ['src/index.ts', 'src/capacitor/index.ts'],
    dts: {
      tsgo: true,
    },
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
