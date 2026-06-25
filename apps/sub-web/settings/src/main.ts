import '@nebula-studio-internal/tailwind/electron';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
import App from './App.vue';
import router from './router';

bootSubApp({ App, router });
