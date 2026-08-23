import type {
  LowCodeBinding,
  LowCodeRuntimeContext,
} from '@nebula-studio/low-code-contract';

import { evaluateExpression } from './expression.ts';

export function resolvePath(
  data: Record<string, unknown>,
  path: string,
): unknown {
  return path.split('.').reduce<unknown>((cursor, segment) => {
    if (!cursor || typeof cursor !== 'object') return undefined;
    return (cursor as Record<string, unknown>)[segment];
  }, data);
}

export function resolveBinding(
  binding: LowCodeBinding,
  context: LowCodeRuntimeContext,
): unknown {
  if (binding.kind === 'literal') return binding.value;
  if (binding.kind === 'path') return resolvePath(context.data, binding.path);
  try {
    return evaluateExpression(binding.expression, context);
  } catch {
    return undefined;
  }
}

export function resolveProps(
  props: Record<string, unknown> | undefined,
  bindings: Record<string, LowCodeBinding> | undefined,
  context: LowCodeRuntimeContext,
): Record<string, unknown> {
  const resolved = { ...props };
  if (!bindings) return resolved;
  for (const [key, binding] of Object.entries(bindings)) {
    resolved[key] = resolveBinding(binding, context);
  }
  return resolved;
}
