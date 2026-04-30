import type { AppModule, ModuleContext } from '../types';

import { URL } from 'node:url';

import { shell } from 'electron';
import { useLogger, isDevelopment } from '@nebula-studio/utils';
const { appLifecycleLogger } = useLogger();

export class ExternalUrls implements AppModule {
  readonly #externalUrls: Set<string>;

  constructor(externalUrls: Set<string>) {
    this.#externalUrls = externalUrls;
  }

  enable({ app }: ModuleContext): Promise<void> | void {
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        const { origin } = new URL(url);

        if (this.#externalUrls.has(origin)) {
          shell.openExternal(url).catch(appLifecycleLogger.error);
        } else if (isDevelopment) {
          appLifecycleLogger.warn(
            `Blocked the opening of a disallowed external origin: ${origin}`,
          );
        }

        // Prevent creating a new window.
        return { action: 'deny' };
      });
    });
  }
}

export function allowExternalUrls(
  ...args: ConstructorParameters<typeof ExternalUrls>
): ExternalUrls {
  return new ExternalUrls(...args);
}
