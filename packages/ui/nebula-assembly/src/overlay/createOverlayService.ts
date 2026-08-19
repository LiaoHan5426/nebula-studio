import type { OverlayService } from '../types/overlay';

import { reactive, ref } from 'vue';

interface ConfirmQueueItem {
  message: string;
  resolve: (value: boolean) => void;
}

export function createOverlayService(): OverlayService {
  const confirmState = reactive({
    open: false,
    message: '',
  });
  const teleportTarget = ref<HTMLElement | null>(null);
  const queue: ConfirmQueueItem[] = [];
  let active: ConfirmQueueItem | null = null;

  function showNext(): void {
    if (active || queue.length === 0) {
      return;
    }
    active = queue.shift() ?? null;
    if (!active) return;
    confirmState.message = active.message;
    confirmState.open = true;
  }

  return {
    confirmState,
    teleportTarget,
    setTeleportTarget(element: HTMLElement | null) {
      teleportTarget.value = element;
    },
    confirm(message: string): Promise<boolean> {
      return new Promise((resolve) => {
        queue.push({ message, resolve });
        showNext();
      });
    },
    answerConfirm(confirmed: boolean) {
      active?.resolve(confirmed);
      active = null;
      confirmState.open = false;
      confirmState.message = '';
      showNext();
    },
    cancelAllConfirms(confirmed = false) {
      active?.resolve(confirmed);
      active = null;
      while (queue.length > 0) {
        queue.shift()?.resolve(confirmed);
      }
      confirmState.open = false;
      confirmState.message = '';
    },
    toast() {
      /* stub: host adapter may replace this */
    },
  };
}
