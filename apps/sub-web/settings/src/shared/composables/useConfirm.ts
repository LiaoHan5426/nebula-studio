import type { ConfirmOverlayState } from '@nebula-studio/nebula-assembly';

import { tryUseNebulaAssembly } from '@nebula-studio/nebula-assembly';

/** Settings owns the confirmation workflow; the shared assembly owns its overlay state. */
export function useConfirmState(): ConfirmOverlayState {
  const assembly = tryUseNebulaAssembly();
  if (!assembly) throw new Error('Settings confirmation requires NebulaAssembly');
  return assembly.overlay.confirmState;
}

export function useConfirm(message: string): Promise<boolean> {
  const assembly = tryUseNebulaAssembly();
  if (!assembly) return Promise.resolve(false);
  return assembly.overlay.confirm(message);
}

export function answerConfirm(confirmed: boolean): void {
  const assembly = tryUseNebulaAssembly();
  assembly?.overlay.answerConfirm(confirmed);
}
