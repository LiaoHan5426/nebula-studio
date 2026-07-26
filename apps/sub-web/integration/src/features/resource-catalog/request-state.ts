import type { AccessRequestDraft } from './types';

export type AccessRequestStep = 1 | 2 | 3 | 4;

export function canAdvanceAccessRequest(
  step: AccessRequestStep,
  draft: AccessRequestDraft,
): boolean {
  if (step === 1) return draft.purpose.trim().length >= 10;
  if (step === 2) return Boolean(draft.environment && draft.duration);
  if (step === 3) {
    return draft.scope.trim().length > 0 && draft.sensitivityConfirmed;
  }
  return true;
}

export function nextAccessRequestStep(
  step: AccessRequestStep,
): AccessRequestStep {
  return Math.min(4, step + 1) as AccessRequestStep;
}

export function previousAccessRequestStep(
  step: AccessRequestStep,
): AccessRequestStep {
  return Math.max(1, step - 1) as AccessRequestStep;
}
