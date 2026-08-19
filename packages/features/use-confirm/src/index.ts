import { reactive } from 'vue';

import { tryUseNebulaAssembly } from '@nebula-studio/nebula-assembly';

export interface ConfirmState {
  message: string;
  open: boolean;
}

interface ConfirmQueueItem {
  message: string;
  resolve: (value: boolean) => void;
}

const legacyState = reactive<ConfirmState>({
  open: false,
  message: '',
});

const queue: ConfirmQueueItem[] = [];
let active: ConfirmQueueItem | null = null;

function showNext(): void {
  if (active || queue.length === 0) {
    return;
  }
  active = queue.shift() ?? null;
  if (!active) return;
  legacyState.message = active.message;
  legacyState.open = true;
}

/** Reactive state for building a `<ConfirmDialog>` component. */
export function useConfirmState(): ConfirmState {
  const assembly = tryUseNebulaAssembly();
  if (assembly) {
    return assembly.overlay.confirmState;
  }
  return legacyState;
}

/** Enqueue a confirm dialog. Concurrent calls are shown one at a time. */
export function useConfirm(message: string): Promise<boolean> {
  const assembly = tryUseNebulaAssembly();
  if (assembly) {
    return assembly.overlay.confirm(message);
  }
  return new Promise((resolve) => {
    queue.push({ message, resolve });
    showNext();
  });
}

/** Programmatically answer the current confirm dialog. */
export function answerConfirm(confirmed: boolean): void {
  const assembly = tryUseNebulaAssembly();
  if (assembly) {
    assembly.overlay.answerConfirm(confirmed);
    return;
  }
  active?.resolve(confirmed);
  active = null;
  legacyState.open = false;
  legacyState.message = '';
  showNext();
}

/** Cancel all pending confirms (e.g. on unmount). */
export function cancelAllConfirms(confirmed = false): void {
  const assembly = tryUseNebulaAssembly();
  if (assembly) {
    assembly.overlay.cancelAllConfirms(confirmed);
    return;
  }
  active?.resolve(confirmed);
  active = null;
  while (queue.length > 0) {
    queue.shift()?.resolve(confirmed);
  }
  legacyState.open = false;
  legacyState.message = '';
}
