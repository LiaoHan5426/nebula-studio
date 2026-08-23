import { defineNebulaHostConfig } from '@nebula-studio-internal/build-kit';

export default defineNebulaHostConfig({
  configModuleUrl: import.meta.url,
  federationName: 'nebula_mf_poc_host',
  devPort: 5190,
});
