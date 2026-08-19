import type { Ref } from 'vue';

export { overlayContainerKey } from '@nebula-studio/nebula-ui';

export interface ConfirmOverlayState {
  message: string;
  open: boolean;
}

export interface OverlayService {
  answerConfirm(confirmed: boolean): void;
  cancelAllConfirms(confirmed?: boolean): void;
  confirm(message: string): Promise<boolean>;
  readonly confirmState: ConfirmOverlayState;
  setTeleportTarget(element: HTMLElement | null): void;
  readonly teleportTarget: Ref<HTMLElement | null>;
  toast(message: string): void;
}
