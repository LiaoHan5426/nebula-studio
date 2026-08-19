/**
 * Public feature boundary for plugin catalog administration.
 */
export { loadPluginCatalog } from '@/features/plugin-catalog/api';
export {
  buildNodeSchemasFromCatalog,
  isDagOrchestrationPlugin,
  mapPluginCatalogItem,
} from '@/features/plugin-catalog/mappers';
export type {
  PluginCatalogViewModel,
  PluginSchemaField,
} from '@/features/plugin-catalog/types';
