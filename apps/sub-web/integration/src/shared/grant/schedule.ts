export type GrantScheduleType =
  | 'ALWAYS'
  | 'DAILY'
  | 'WEEKDAY'
  | 'WEEKEND'
  | 'MON'
  | 'TUE'
  | 'WED'
  | 'THU'
  | 'FRI'
  | 'SAT'
  | 'SUN';

export interface GrantScheduleOption {
  value: GrantScheduleType;
  label: string;
}

export const GRANT_SCHEDULE_OPTIONS: GrantScheduleOption[] = [
  { value: 'ALWAYS', label: '不限时段' },
  { value: 'DAILY', label: '每天' },
  { value: 'WEEKDAY', label: '工作日' },
  { value: 'WEEKEND', label: '周末' },
  { value: 'MON', label: '周一' },
  { value: 'TUE', label: '周二' },
  { value: 'WED', label: '周三' },
  { value: 'THU', label: '周四' },
  { value: 'FRI', label: '周五' },
  { value: 'SAT', label: '周六' },
  { value: 'SUN', label: '周日' },
];

const DAY_LABELS: Record<string, string> = {
  DAILY: '每天',
  WEEKDAY: '工作日',
  WEEKEND: '周末',
  MON: '周一',
  TUE: '周二',
  WED: '周三',
  THU: '周四',
  FRI: '周五',
  SAT: '周六',
  SUN: '周日',
};

export function formatGrantScheduleLabel(
  scheduleType?: string | null,
  scheduleStartTime?: string | null,
  scheduleEndTime?: string | null,
  scheduleLabel?: string | null,
): string {
  if (scheduleLabel) return scheduleLabel;
  if (!scheduleType || scheduleType === 'ALWAYS') return '不限时段';
  const day = DAY_LABELS[scheduleType] ?? scheduleType;
  if (scheduleStartTime && scheduleEndTime) {
    return `${day} ${scheduleStartTime}-${scheduleEndTime}`;
  }
  return day;
}

function parseHm(value: string): number {
  const [h = 0, m = 0] = value.split(':').map(Number);
  return h * 60 + m;
}

function matchesDayPattern(scheduleType: string, day: number): boolean {
  switch (scheduleType) {
    case 'DAILY':
      return true;
    case 'WEEKDAY':
      return day >= 1 && day <= 5;
    case 'WEEKEND':
      return day === 6 || day === 0;
    case 'MON':
      return day === 1;
    case 'TUE':
      return day === 2;
    case 'WED':
      return day === 3;
    case 'THU':
      return day === 4;
    case 'FRI':
      return day === 5;
    case 'SAT':
      return day === 6;
    case 'SUN':
      return day === 0;
    default:
      return false;
  }
}

function isWithinTimeWindow(
  nowMin: number,
  startMin: number,
  endMin: number,
): boolean {
  if (startMin === endMin) return true;
  if (startMin < endMin) {
    return nowMin >= startMin && nowMin <= endMin;
  }
  return nowMin >= startMin || nowMin <= endMin;
}

/** 客户端预览：当前是否处于授权服务时间段外 */
export function isOutsideGrantSchedule(
  scheduleType?: string | null,
  scheduleStartTime?: string | null,
  scheduleEndTime?: string | null,
  timezone = 'Asia/Shanghai',
): boolean {
  if (!scheduleType || scheduleType === 'ALWAYS') return false;
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  const day = dayMap[weekday] ?? -1;
  if (!matchesDayPattern(scheduleType, day)) return true;
  if (scheduleStartTime && scheduleEndTime) {
    const nowMin = hour * 60 + minute;
    return !isWithinTimeWindow(
      nowMin,
      parseHm(scheduleStartTime),
      parseHm(scheduleEndTime),
    );
  }
  return false;
}
