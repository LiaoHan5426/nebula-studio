import type { WebContents } from 'electron';

export abstract class AbstractSecurityRule {
  abstract applyRule(contents: WebContents): Promise<void> | void;
}
