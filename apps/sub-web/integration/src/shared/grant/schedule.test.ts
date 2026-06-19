import { describe, expect, it } from 'vitest';

import {
  formatGrantScheduleLabel,
  isOutsideGrantSchedule,
} from '@/shared/grant/schedule';

describe('grant schedule', () => {
  it('formats always-on schedules', () => {
    expect(formatGrantScheduleLabel('ALWAYS')).toBe('不限时段');
    expect(formatGrantScheduleLabel(null)).toBe('不限时段');
  });

  it('formats day and time window labels', () => {
    expect(formatGrantScheduleLabel('WEEKDAY', '09:00', '18:00')).toBe(
      '工作日 09:00-18:00',
    );
    expect(formatGrantScheduleLabel('MON', null, null, '自定义时段')).toBe(
      '自定义时段',
    );
  });

  it('does not block always-on schedules', () => {
    expect(isOutsideGrantSchedule('ALWAYS')).toBe(false);
    expect(isOutsideGrantSchedule(undefined)).toBe(false);
  });
});
