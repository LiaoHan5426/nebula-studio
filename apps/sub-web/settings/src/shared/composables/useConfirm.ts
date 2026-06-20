import { reactive } from 'vue';

interface ConfirmState {
  open: boolean;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

const state = reactive<ConfirmState>({
  open: false,
  message: '',
  resolve: null,
});

export function useConfirmState(): ConfirmState {
  return state;
}

export function useConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    state.message = message;
    state.open = true;
    state.resolve = resolve;
  });
}

export function answerConfirm(confirmed: boolean): void {
  state.open = false;
  state.resolve?.(confirmed);
  state.resolve = null;
}
