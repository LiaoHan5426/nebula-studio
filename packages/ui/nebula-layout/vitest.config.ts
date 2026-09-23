import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [Vue()],
  test: {
    name: 'nebula-layout',
    environment: 'happy-dom',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    css: false,
  },
});
