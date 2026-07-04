/**
 * 内置图标快捷映射 — 字符串简写 → 完整 Iconify 名称
 * 根据项目中常用的图标名称扩展
 */
export const PRESET_ICONS: Record<string, string> = {
  // Navigation
  home: 'lucide:home',
  settings: 'lucide:settings',
  file: 'lucide:file',
  integration: 'lucide:puzzle',
  folder: 'lucide:folder',
  folderOpen: 'lucide:folder-open',

  // Actions
  add: 'lucide:plus',
  remove: 'lucide:minus',
  delete: 'lucide:trash-2',
  edit: 'lucide:pencil',
  save: 'lucide:save',
  close: 'lucide:x',
  search: 'lucide:search',
  refresh: 'lucide:refresh-cw',
  download: 'lucide:download',
  upload: 'lucide:upload',
  copy: 'lucide:copy',
  paste: 'lucide:clipboard',
  undo: 'lucide:undo',
  redo: 'lucide:redo',

  // Navigation arrows
  chevronLeft: 'lucide:chevron-left',
  chevronRight: 'lucide:chevron-right',
  chevronUp: 'lucide:chevron-up',
  chevronDown: 'lucide:chevron-down',
  arrowLeft: 'lucide:arrow-left',
  arrowRight: 'lucide:arrow-right',
  arrowUp: 'lucide:arrow-up',
  arrowDown: 'lucide:arrow-down',

  // Status
  check: 'lucide:check',
  warning: 'lucide:alert-triangle',
  error: 'lucide:alert-circle',
  info: 'lucide:info',
  success: 'lucide:check-circle',
  help: 'lucide:help-circle',

  // UI elements
  menu: 'lucide:menu',
  moreHorizontal: 'lucide:more-horizontal',
  moreVertical: 'lucide:more-vertical',
  eye: 'lucide:eye',
  eyeOff: 'lucide:eye-off',
  lock: 'lucide:lock',
  unlock: 'lucide:unlock',
  star: 'lucide:star',
  heart: 'lucide:heart',
  link: 'lucide:link',
  externalLink: 'lucide:external-link',
  image: 'lucide:image',
  code: 'lucide:code',
  table: 'lucide:table',
  list: 'lucide:list',
  grid: 'lucide:grid',
  filter: 'lucide:filter',
  sort: 'lucide:sort-asc',
  calendar: 'lucide:calendar',
  clock: 'lucide:clock',
  user: 'lucide:user',
  users: 'lucide:users',

  // Editor
  bold: 'lucide:bold',
  italic: 'lucide:italic',
  underline: 'lucide:underline',
  strikethrough: 'lucide:strikethrough',
  alignLeft: 'lucide:align-left',
  alignCenter: 'lucide:align-center',
  alignRight: 'lucide:align-right',
  alignJustify: 'lucide:align-justify',
};

/**
 * 检查字符串是否为 HTTP/HTTPS URL
 */
export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * 检查字符串是否为 Iconify 图标名称（包含冒号）
 */
export function isIconifyName(value: string): boolean {
  return value.includes(':');
}

/**
 * 解析图标字符串，返回标准化结果
 */
export function resolveIcon(icon: string): {
  type: 'component' | 'url' | 'iconify';
  value: string;
} {
  if (isHttpUrl(icon)) {
    return { type: 'url', value: icon };
  }
  if (isIconifyName(icon)) {
    return { type: 'iconify', value: icon };
  }
  // 尝试从预设中查找
  const preset = PRESET_ICONS[icon];
  if (preset) {
    return { type: 'iconify', value: preset };
  }
  // 默认当作 lucide 图标
  return { type: 'iconify', value: `lucide:${icon}` };
}
