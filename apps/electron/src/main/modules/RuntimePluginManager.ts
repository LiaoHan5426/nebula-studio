export interface RuntimePlugin {
  name: string;
  setup(): Promise<void> | void;
}

export class RuntimePluginManager {
  readonly #plugins = new Map<string, RuntimePlugin>();

  register(plugin: RuntimePlugin): void {
    this.#plugins.set(plugin.name, plugin);
  }

  async startAll(): Promise<void> {
    for (const plugin of this.#plugins.values()) {
      await plugin.setup();
    }
  }
}
