import type { ObjectDirective } from 'vue';
import type { TooltipPlacement } from '../utils/tooltip';
import {
  hideFloatingTooltipByTarget,
  scheduleHideFloatingTooltipByTarget,
  showFloatingTooltip,
} from '../utils/tooltip';

type TooltipValue =
  | string
  | {
      content: string;
      placement?: TooltipPlacement;
    };

function normalize(value: TooltipValue): {
  content: string;
  placement: TooltipPlacement;
} {
  if (typeof value === 'string') {
    return { content: value.trim(), placement: 'top' };
  }
  return {
    content: value.content.trim(),
    placement: value.placement ?? 'top',
  };
}

const cleanupKey = Symbol('nebula-tooltip-cleanup');

function bindAutoPlacement(
  el: HTMLElement,
  content: string,
  placement: TooltipPlacement,
): void {
  (el as HTMLElement & { [cleanupKey]?: () => void })[cleanupKey]?.();
  const updatePlacement = (): void => {
    showFloatingTooltip(el, content, placement);
  };
  const hide = (): void => {
    scheduleHideFloatingTooltipByTarget(el);
  };
  el.addEventListener('mouseenter', updatePlacement);
  el.addEventListener('focus', updatePlacement);
  el.addEventListener('mouseleave', hide);
  el.addEventListener('blur', hide);
  (el as HTMLElement & { [cleanupKey]?: () => void })[cleanupKey] = () => {
    el.removeEventListener('mouseenter', updatePlacement);
    el.removeEventListener('focus', updatePlacement);
    el.removeEventListener('mouseleave', hide);
    el.removeEventListener('blur', hide);
  };
}

function applyTooltip(el: HTMLElement, value: TooltipValue): void {
  const { content, placement } = normalize(value);
  if (!content) {
    clearTooltip(el);
    return;
  }
  el.classList.add('nebula-has-tooltip');
  el.setAttribute('data-nebula-tooltip-enabled', 'true');
  bindAutoPlacement(el, content, placement);
}

function clearTooltip(el: HTMLElement): void {
  (el as HTMLElement & { [cleanupKey]?: () => void })[cleanupKey]?.();
  delete (el as HTMLElement & { [cleanupKey]?: () => void })[cleanupKey];
  el.classList.remove('nebula-has-tooltip');
  el.removeAttribute('data-nebula-tooltip-enabled');
  hideFloatingTooltipByTarget(el);
}

export const nebulaTooltip: ObjectDirective<HTMLElement, TooltipValue> = {
  mounted(el, binding) {
    if (binding.value) applyTooltip(el, binding.value);
  },
  updated(el, binding) {
    if (!binding.value) {
      clearTooltip(el);
      return;
    }
    applyTooltip(el, binding.value);
  },
  unmounted(el) {
    clearTooltip(el);
  },
};
