import type { BackendLoginResult } from '@nebula-studio/auth-provider/backend';

import type { AuthFailure, AuthFlowStep } from './authFlow';

/** Stable backend step codes — do not parse error message text in UI. */
export type AuthNextStepCode =
  | 'COMPLETE'
  | 'MFA_REQUIRED'
  | 'ORG_SELECTION'
  | 'RECOVERY'
  | 'RETRY_CREDENTIALS';

export interface AuthFlowState {
  failure: AuthFailure | null;
  mfaCode: string;
  pendingLogin: BackendLoginResult | null;
  recoveryAccount: string;
  selectedOrgId: string;
  step: AuthFlowStep;
}

export type AuthFlowAction =
  | { type: 'BACK_TO_CREDENTIALS' }
  | { type: 'CREDENTIALS_SUBMITTED'; result: BackendLoginResult }
  | { type: 'FAILURE'; failure: AuthFailure }
  | { type: 'MFA_CODE_CHANGED'; value: string }
  | { type: 'MFA_SUBMITTED' }
  | { type: 'ORG_SELECTED'; orgId: string }
  | { type: 'ORG_SUBMITTED'; result: BackendLoginResult }
  | { type: 'RECOVERY_STARTED'; account: string }
  | { type: 'SUCCESS' };

export function resolveAuthNextStep(
  code: AuthNextStepCode,
): AuthFlowStep | 'token-ready' {
  switch (code) {
    case 'COMPLETE':
      return 'token-ready';
    case 'MFA_REQUIRED':
      return 'mfa';
    case 'ORG_SELECTION':
      return 'organization';
    case 'RECOVERY':
      return 'recovery';
    case 'RETRY_CREDENTIALS':
      return 'failure';
    default:
      return 'failure';
  }
}

export function nextStepFromLoginResult(
  result: BackendLoginResult,
): AuthNextStepCode {
  if (result.needsOrgSelection) return 'ORG_SELECTION';
  if (!result.token) return 'MFA_REQUIRED';
  return 'COMPLETE';
}

export function canPersistFinalToken(state: AuthFlowState): boolean {
  return state.step === 'success';
}

export function authFlowReducer(
  state: AuthFlowState,
  action: AuthFlowAction,
): AuthFlowState {
  switch (action.type) {
    case 'BACK_TO_CREDENTIALS':
      return {
        ...state,
        step: 'credentials',
        failure: null,
        pendingLogin: null,
        selectedOrgId: '',
        mfaCode: '',
        recoveryAccount: '',
      };
    case 'CREDENTIALS_SUBMITTED': {
      const next = nextStepFromLoginResult(action.result);
      if (next === 'COMPLETE') {
        return {
          ...state,
          pendingLogin: action.result,
          step: 'success',
          failure: null,
        };
      }
      if (next === 'ORG_SELECTION') {
        return {
          ...state,
          pendingLogin: action.result,
          step: 'organization',
          failure: null,
        };
      }
      return {
        ...state,
        pendingLogin: action.result,
        step: 'mfa',
        failure: null,
      };
    }
    case 'ORG_SUBMITTED':
      return {
        ...state,
        pendingLogin: action.result,
        step: action.result.token ? 'success' : 'mfa',
        failure: null,
      };
    case 'MFA_SUBMITTED':
      return {
        ...state,
        step: state.pendingLogin?.token ? 'success' : state.step,
      };
    case 'ORG_SELECTED':
      return { ...state, selectedOrgId: action.orgId };
    case 'MFA_CODE_CHANGED':
      return { ...state, mfaCode: action.value };
    case 'RECOVERY_STARTED':
      return {
        ...state,
        recoveryAccount: action.account,
        step: 'recovery',
        failure: null,
      };
    case 'FAILURE':
      return {
        ...state,
        failure: action.failure,
        step: action.failure.kind === 'mfa-required' ? 'mfa' : 'failure',
      };
    case 'SUCCESS':
      return { ...state, step: 'success', failure: null };
    default:
      return state;
  }
}

export function createInitialAuthFlowState(
  entryFailure: AuthFailure | null = null,
): AuthFlowState {
  return {
    step: entryFailure ? 'failure' : 'credentials',
    failure: entryFailure,
    pendingLogin: null,
    selectedOrgId: '',
    mfaCode: '',
    recoveryAccount: '',
  };
}
