import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

export function resolveNodeDisplayLabel(
  type: string,
  config: Record<string, unknown>,
  schemas?: Record<string, PluginNodeSchema>,
  fallback?: string,
): string {
  const schema = schemas?.[type];

  if (type === 'INTERFACE') {
    const interfaceId = config.interfaceId;
    if (
      interfaceId !== undefined &&
      interfaceId !== null &&
      interfaceId !== ''
    ) {
      const field = schema?.fields?.find((item) => item.key === 'interfaceId');
      const match = field?.options?.find(
        (option) => option.value === String(interfaceId),
      );
      if (match?.label) {
        return match.label;
      }
    }
    return schema?.label ?? fallback ?? '原子服务调用';
  }

  return schema?.label ?? fallback ?? type;
}
