import type { MainModule, MainModuleContext } from './MainModule';

export class MainAppLauncher {
  readonly #modules: MainModule[] = [];

  use(module: MainModule): this {
    this.#modules.push(module);
    return this;
  }

  async launch(context: MainModuleContext): Promise<void> {
    for (const module of this.#modules) {
      context.logger.info(`Bootstrapping module: ${module.name}`);
      await module.setup(context);
    }
  }
}
