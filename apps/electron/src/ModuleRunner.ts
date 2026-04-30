import type { AppModule, ModuleContext } from './types';

import { app } from 'electron';

class ModuleRunner {
  #promise: Promise<void>;

  constructor() {
    this.#promise = Promise.resolve();
  }

  init(module: AppModule) {
    const p = module.enable(this.#createModuleContext());

    if (p instanceof Promise) {
      this.#promise = this.#promise.then(() => p);
    }

    return this;
  }

  run() {
    return this.#promise;
  }

  #createModuleContext(): ModuleContext {
    return {
      app,
    };
  }
}

export function createModuleRunner(): ModuleRunner {
  return new ModuleRunner();
}
