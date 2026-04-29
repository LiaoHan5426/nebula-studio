import type { AppModule, ModuleContext } from '../types';

export abstract class AbstractSecurityRule implements AppModule {
  abstract applyRule(contents: Electron.WebContents): Promise<void> | void;

  enable({ app }: ModuleContext): Promise<void> | void {
    app.on('web-contents-created', (_, contents) => this.applyRule(contents));
  }
}
