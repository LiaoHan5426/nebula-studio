import { describe, expect, it } from 'vitest';

import {
  authFlowReducer,
  canPersistFinalToken,
  createInitialAuthFlowState,
  nextStepFromLoginResult,
  resolveAuthNextStep,
} from '../authStateMachine';

describe('auth state machine', () => {
  it('maps backend next-step codes to flow steps', () => {
    expect(resolveAuthNextStep('ORG_SELECTION')).toBe('organization');
    expect(resolveAuthNextStep('MFA_REQUIRED')).toBe('mfa');
    expect(resolveAuthNextStep('COMPLETE')).toBe('token-ready');
  });

  it('derives org selection from login result', () => {
    expect(
      nextStepFromLoginResult({
        username: 'demo',
        needsOrgSelection: true,
        organizations: [],
      }),
    ).toBe('ORG_SELECTION');
  });

  it('blocks final token persistence until success step', () => {
    const state = createInitialAuthFlowState();
    expect(canPersistFinalToken(state)).toBe(false);
    const success = authFlowReducer(state, {
      type: 'CREDENTIALS_SUBMITTED',
      result: { username: 'demo', token: 't-1' },
    });
    expect(canPersistFinalToken(success)).toBe(true);
  });

  it('routes MFA-required failures without storing token early', () => {
    const next = authFlowReducer(createInitialAuthFlowState(), {
      type: 'FAILURE',
      failure: {
        kind: 'mfa-required',
        title: '需要二次验证',
        message: 'test',
        retryable: false,
      },
    });
    expect(next.step).toBe('mfa');
    expect(canPersistFinalToken(next)).toBe(false);
  });
});
