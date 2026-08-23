import {
  defineNebulaSubAppConfig,
  nebulaVueDemoPlugin,
} from '@nebula-studio-internal/build-kit';

export default defineNebulaSubAppConfig({
  configModuleUrl: import.meta.url,
  appId: 'docs',
  plugins: [nebulaVueDemoPlugin()],
  federation: {
    name: 'nebula_docs',
    exposes: {
      './application': './src/federation.ts',
    },
  },
});
