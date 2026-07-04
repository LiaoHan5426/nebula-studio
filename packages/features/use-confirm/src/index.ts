import { reactive } from 'vue';

export interface ConfirmState {
  open: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

const state = reactive<ConfirmState>({
  open: false,
  message: '',
  resolve: null,
});

/** Reactive state for building a `<ConfirmDialog>` component. */
export function useConfirmState(): ConfirmState {
  return state;
}

/**
 * Show a confirm dialog with the given message.
 * Returns a promise that resolves to `true` (confirmed) or `false` (cancelled).
 *
 * @example
 * ```ts
 * const confirmed = await useConfirm('Are you sure?');
 * if (confirmed) { ... }
 * ```
 */
export function useConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    state.message = message;
    state.open = true;
    state.resolve = resolve;
  });
}

/** Programmatically answer the current confirm dialog. */
export function answerConfirm(confirmed: boolean): void {
  state.open = false;
  state.resolve?.(confirmed);
  state.resolve = null;
}
