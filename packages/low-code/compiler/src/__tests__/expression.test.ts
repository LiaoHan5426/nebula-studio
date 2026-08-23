import { describe, expect, it } from 'vitest';

import {
  evaluateExpression,
  evaluateExpressionIsolated,
  LowCodeExpressionError,
} from '../expression.ts';

const ctx = {
  data: { metrics: { orders: 41 }, title: '运营大屏', flag: true },
};

describe('evaluateExpression', () => {
  it('resolves member access and arithmetic without eval', () => {
    expect(evaluateExpression('metrics.orders + 1', ctx)).toBe(42);
    expect(evaluateExpression('title == "运营大屏" && flag', ctx)).toBe(true);
    expect(evaluateExpression('!(metrics.orders < 10)', ctx)).toBe(true);
  });

  it('rejects forbidden identifiers and oversized expressions', () => {
    expect(() => evaluateExpression('constructor', ctx)).toThrow(
      LowCodeExpressionError,
    );
    expect(() => evaluateExpression('window.alert', ctx)).toThrow(
      /not allowed/,
    );
    expect(() => evaluateExpression('a+'.repeat(200), ctx)).toThrow(/too long/);
  });

  it('evaluates isolated expressions with a timeout budget', async () => {
    await expect(
      evaluateExpressionIsolated('metrics.orders + 1', ctx, 200),
    ).resolves.toBe(42);
  });
});
