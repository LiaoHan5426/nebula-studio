import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [Vue()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
