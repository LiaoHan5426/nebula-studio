import '@nebula-studio-internal/tailwind/electron';
import { bootSubApp } from '@nebula-studio-electron/electron-bridge/vue';
import './assets/main.css';
import './runtime/registerIntegratedApps';

import App from './App.vue';

bootSubApp({ App });
