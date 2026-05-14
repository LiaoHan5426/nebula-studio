import type { InjectionKey } from 'vue';

/** 左侧菜单切换当前文档 feature（如 Table API 区跳转至 Pagination） */
export type DocsNavigateToFeature = (featureId: string) => void;

export const DOCS_NAVIGATE_TO_FEATURE: InjectionKey<DocsNavigateToFeature> =
  Symbol('docsNavigateToFeature');
