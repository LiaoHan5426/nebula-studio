import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import { pluginCatalogApi } from '@/features/plugin/api';
import type { ApiInterface } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

import {
  buildNodeSchemasFromCatalog,
  withAtomicInterfaceOptions,
} from './dagNodeSchemas';

export async function loadDagNodeSchemas(
  atomicInterfaces: ApiInterface[] = [],
): Promise<Record<string, PluginNodeSchema>> {
  const response = await pluginCatalogApi.list();
  const catalog = isApiSuccess(response) ? (response.data ?? []) : [];
  const schemas = buildNodeSchemasFromCatalog(catalog);
  return withAtomicInterfaceOptions(
    schemas,
    atomicInterfaces
      .filter((item) => item.interfaceType === 'ATOMIC')
      .map((item) => ({
        interfaceId: item.interfaceId,
        interfaceName: item.interfaceName,
        endpointUri: item.endpointUri,
      })),
  );
}
