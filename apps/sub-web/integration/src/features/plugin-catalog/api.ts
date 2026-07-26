import { pluginCatalogApi } from '@/features/plugin/api';
import { isApiSuccess } from '@/shared/types';

import { mapPluginCatalogItem } from './mappers';
import type { PluginCatalogViewModel } from './types';

export async function loadPluginCatalog(): Promise<PluginCatalogViewModel[]> {
  const response = await pluginCatalogApi.list();
  if (!isApiSuccess(response)) {
    throw new Error(response.message || response.error || '插件目录加载失败');
  }
  return response.data.map(mapPluginCatalogItem);
}
