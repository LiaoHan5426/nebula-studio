import { describe, expect, it } from 'vitest';

import { isBlankBpmn } from '../constants/integrationStarterBpmn';

describe('isBlankBpmn', () => {
  it('treats missing and empty xml as blank', () => {
    expect(isBlankBpmn(undefined)).toBe(true);
    expect(isBlankBpmn(null)).toBe(true);
    expect(isBlankBpmn('')).toBe(true);
    expect(isBlankBpmn('   ')).toBe(true);
  });

  it('does not call trim on non-strings', () => {
    expect(isBlankBpmn({ code: 200, isSuccess: true })).toBe(true);
    expect(isBlankBpmn(1)).toBe(true);
  });

  it('accepts bpmn process markup', () => {
    expect(isBlankBpmn('<bpmn:process id="p"/>')).toBe(false);
  });
});
