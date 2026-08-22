/**
 * Isolated Phase 0 Electron vehicle. Does not load production apps/web or WindowManager.
 *
 * HTTP (dev URL):  node ./apps/mf-poc-host/electron-poc/launch.mjs
 * file protocol:   same command plus --file  (after remotes + host dist exist)
 * serve check:     same command plus --check
 */
import { existsSync } from 'node:fs';

import {
  federationProtocolPrivileges,
  MF_POC_SCHEME,
} from '@nebula-studio/federation-protocol';

import { app, BrowserWindow, net, protocol } from 'electron';

import { createPocResponse, pocDistRoots } from './poc-protocol.mjs';

protocol.registerSchemesAsPrivileged([
  {
    scheme: MF_POC_SCHEME,
    privileges: federationProtocolPrivileges(),
  },
]);

const checkOnly = process.argv.includes('--check');
const fileMode = checkOnly || process.argv.includes('--file');

function registerMfPocProtocol() {
  protocol.handle(MF_POC_SCHEME, (request) => {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
        },
      });
    }
    try {
      const url = new URL(request.url);
      const result = createPocResponse(url.hostname, url.pathname);
      return new Response(result.body, {
        status: result.status,
        headers: result.headers,
      });
    } catch (error) {
      return new Response(String(error), {
        status: 404,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'access-control-allow-origin': '*',
        },
      });
    }
  });
}

async function verifyPackagedLikeServe() {
  const required = [
    ['hello', pocDistRoots.hello],
    ['hello-style-b', pocDistRoots['hello-style-b']],
    ['hello-dual', pocDistRoots['hello-dual']],
    ['host', pocDistRoots.host],
  ];
  for (const [name, dir] of required) {
    if (!existsSync(dir)) {
      throw new Error(
        `missing ${name} dist at ${dir}; run vp run check:mf-poc first`,
      );
    }
  }

  const hrefs = [
    'mf-poc://hello/mf-manifest.json',
    'mf-poc://hello-style-b/mf-manifest.json',
    'mf-poc://hello-dual/mf-manifest.json',
    'mf-poc://host/index.html',
  ];
  for (const href of hrefs) {
    const response = await net.fetch(href);
    if (!response.ok) {
      throw new Error(`${href} -> ${response.status}`);
    }
    console.log(`[mf-poc-electron] ${href} ${response.status}`);
  }

  const manifest = await net.fetch('mf-poc://hello/mf-manifest.json');
  const json = await manifest.json();
  if (json?.metaData?.publicPath !== 'mf-poc://hello/') {
    throw new Error(
      `expected rewritten publicPath, got ${json?.metaData?.publicPath}`,
    );
  }
  const remoteEntry = await net.fetch('mf-poc://hello/remoteEntry.js');
  const contentType = remoteEntry.headers.get('content-type') ?? '';
  if (!contentType.includes('javascript')) {
    throw new Error(`remoteEntry.js content-type ${contentType}`);
  }

  const window = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  window.webContents.on('console-message', (event) => {
    console.log('[mf-poc-renderer]', event.message);
  });
  await window.loadURL('mf-poc://host/index.html?mf=file');
  const deadline = Date.now() + 20000;
  let report = '';
  while (Date.now() < deadline) {
    report = await window.webContents.executeJavaScript(
      `document.querySelector('#report')?.textContent ?? ''`,
    );
    if (report.includes('"isolated": true') && report.includes('runtime-ok')) {
      window.destroy();
      console.log('[mf-poc-electron] file-mode renderer mount passed');
      return;
    }
    if (report.includes('"isolated": false')) {
      window.destroy();
      throw new Error(report);
    }
    if (report && !report.includes('"isolated"')) {
      window.destroy();
      throw new Error(report);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  window.destroy();
  throw new Error(`file-mode renderer mount timeout: ${report}`);
}

void app.whenReady().then(async () => {
  registerMfPocProtocol();
  if (checkOnly) {
    try {
      await verifyPackagedLikeServe();
      app.exit(0);
    } catch (error) {
      console.error('[mf-poc-electron]', error);
      app.exit(1);
    }
    return;
  }

  app.on('browser-window-created', (_event, created) => {
    created.webContents.setWindowOpenHandler(({ url }) => {
      if (
        url.startsWith('mf-poc://') ||
        url.startsWith('http://localhost:') ||
        url.startsWith('http://127.0.0.1:')
      ) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 720,
            height: 560,
            webPreferences: {
              sandbox: false,
              contextIsolation: true,
              nodeIntegration: false,
            },
          },
        };
      }
      return { action: 'deny' };
    });
  });

  const window = new BrowserWindow({
    width: 1100,
    height: 840,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.webContents.on('console-message', (event) => {
    console.log('[mf-poc-renderer]', event.message);
  });

  if (fileMode) {
    await window.loadURL('mf-poc://host/index.html?mf=file');
  } else {
    await window.loadURL('http://localhost:5190/?mf=http');
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
