import { reactive } from 'vue';

export interface ConfirmState {
  open: boolean;
  message: string;
}

interface ConfirmQueueItem {
  message: string;
  resolve: (value: boolean) => void;
}

const state = reactive<ConfirmState>({
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
  state.message = active.message;
  state.open = true;
}

/** Reactive state for building a `<ConfirmDialog>` component. */
export function useConfirmState(): ConfirmState {
  return state;
}

/** Enqueue a confirm dialog. Concurrent calls are shown one at a time. */
export function useConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    queue.push({ message, resolve });
    showNext();
  });
}

/** Programmatically answer the current confirm dialog. */
export function answerConfirm(confirmed: boolean): void {
  active?.resolve(confirmed);
  active = null;
  state.open = false;
  state.message = '';
  showNext();
}

/** Cancel all pending confirms (e.g. on unmount). */
export function cancelAllConfirms(confirmed = false): void {
  active?.resolve(confirmed);
  active = null;
  while (queue.length > 0) {
    queue.shift()?.resolve(confirmed);
  }
  state.open = false;
  state.message = '';
}
