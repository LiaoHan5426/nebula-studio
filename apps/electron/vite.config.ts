import { resolve } from 'node:path';
import { defineConfig } from 'vite-plus';
import { nebulaStudioElectronPlugin } from '@nebula-studio/vite-electron-plugin';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const capacitorElectronDistEntry = resolve(
  workspaceRoot,
  'packages/capacitor-electron/dist/index.mjs',
);
const capacitorElectronCwd = resolve(
  workspaceRoot,
  'packages/capacitor-electron',
);
const electronDistMainEntry = resolve(import.meta.dirname, 'dist/src/main.cjs');
const electronDistPreloadEntry = resolve(
  import.meta.dirname,
  'dist/src/preload.cjs',
);

export default defineConfig({
  server: {
    port: 5176,
    strictPort: true,
  },
  pack: {
    format: ['cjs'],
    minify: true,
  },
  plugins: [
    nebulaStudioElectronPlugin({
      workspaceRoot,
      electronCwd: import.meta.dirname,
      frontendDevUrl: 'http://localhost:5173',
      prebuildCommand: {
        command: 'vp',
        args: [
          'exec',
          'esbuild',
          'src/index.ts',
          '--bundle',
          '--platform=node',
          '--format=esm',
          '--outfile=dist/index.mjs',
        ],
        cwd: capacitorElectronCwd,
      },
      electronBuildCommand: {
        command: 'vp',
        args: [
          'exec',
          'esbuild',
          'src/main.ts',
          'src/preload.ts',
          '--bundle',
          '--platform=node',
          '--format=cjs',
          '--external:electron',
          '--outdir=dist/src',
          '--out-extension:.js=.cjs',
          '--watch',
          '--minify',
        ],
        cwd: import.meta.dirname,
      },
      electronRuntimeCommand: {
        command: 'vp',
        args: ['exec', 'electron', './dist/src/main.cjs'],
        cwd: import.meta.dirname,
        env: { VITE_DEV_SERVER_URL: 'http://localhost:5173' },
      },
      startFrontendDevServer: true,
      frontendDevCommand: {
        command: 'vp',
        args: ['run', 'website#dev:electron'],
        cwd: workspaceRoot,
      },
      waitForPaths: [
        capacitorElectronDistEntry,
        electronDistMainEntry,
        electronDistPreloadEntry,
      ],
    }),
  ],
});
