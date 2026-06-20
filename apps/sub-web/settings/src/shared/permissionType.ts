const PERM_TYPE_LABELS: Record<string, string> = {
  MENU: '菜单',
  PERMISSION: '权限',
  BUTTON: '按钮',
  API: '接口',
};

export function permTypeLabel(type?: string | null): string {
  if (!type) return '-';
  const normalized = type.trim().toUpperCase();
  return PERM_TYPE_LABELS[normalized] ?? type;
}

export const PERM_TYPE_OPTIONS = [
  { value: 'MENU', label: '菜单 (MENU)' },
  { value: 'PERMISSION', label: '权限 (PERMISSION)' },
  { value: 'BUTTON', label: '按钮 (BUTTON)' },
  { value: 'API', label: '接口 (API)' },
] as const;

export function isButtonPermType(type?: string | null): boolean {
  return type?.trim().toUpperCase() === 'BUTTON';
}
