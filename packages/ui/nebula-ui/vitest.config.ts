import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [Vue(), VueJsx()],
  test: {
    name: 'nebula-ui',
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        settings: {
          handleDisabledFileLoadingAsSuccess: true,
        },
      },
    },
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    css: false,
  },
});
