import '@nebula-studio-internal/tailwind/electron';
import type { App as VueApp } from 'vue';
import DefaultTheme from 'vitepress/theme-without-fonts';
import DocsPlayground from './DocsPlayground';
import './style.css';

export default {
  extends: DefaultTheme,
  enhanceApp(ctx: { app: VueApp }) {
    ctx.app.component('DocsPlayground', DocsPlayground);
  },
};
