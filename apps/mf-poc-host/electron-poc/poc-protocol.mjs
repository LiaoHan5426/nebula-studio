import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createFederationDistResponse,
  MF_POC_SCHEME,
  resolveFederationDistFile,
  rewriteFederationPublicPath,
} from '@nebula-studio/federation-protocol';

const studioRoot = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../..',
);

export const pocDistRoots = {
  host: join(studioRoot, 'apps/mf-poc-host/dist'),
  hello: join(studioRoot, 'apps/remotes/hello/dist'),
  'hello-style-b': join(studioRoot, 'apps/remotes/hello-style-b/dist'),
  'hello-dual': join(studioRoot, 'apps/remotes/hello-dual/dist'),
};

export function resolvePocFile(hostname, pathname) {
  return resolveFederationDistFile(pocDistRoots, hostname, pathname);
}

export function createPocResponse(hostname, pathname) {
  return createFederationDistResponse({
    roots: pocDistRoots,
    hostname,
    pathname,
    scheme: MF_POC_SCHEME,
  });
}

export { rewriteFederationPublicPath };
