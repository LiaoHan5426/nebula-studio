import type {
  ExactComponentLock,
  LowCodeApplicationDefinitionVersion,
  LowCodeBinding,
  LowCodeNode,
  LowCodeRuntimeSnapshot,
} from './types.ts';

import { LOW_CODE_SCHEMA_VERSION } from './types.ts';

const FORBIDDEN_KEYS = new Set(['eval', 'javascript', 'script']);

export class LowCodeContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LowCodeContractError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertNoForbiddenKeys(record: Record<string, unknown>, path: string) {
  for (const key of Object.keys(record)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw new LowCodeContractError(`${path} must not declare ${key}`);
    }
  }
}

function parseBinding(value: unknown, path: string): LowCodeBinding {
  if (!isRecord(value) || typeof value.kind !== 'string') {
    throw new LowCodeContractError(`${path} must be a binding`);
  }
  if (value.kind === 'literal') {
    return { kind: 'literal', value: value.value };
  }
  if (value.kind === 'path') {
    if (typeof value.path !== 'string' || !value.path.trim()) {
      throw new LowCodeContractError(`${path}.path is required`);
    }
    return { kind: 'path', path: value.path };
  }
  if (value.kind === 'expr') {
    if (typeof value.expression !== 'string' || !value.expression.trim()) {
      throw new LowCodeContractError(`${path}.expression is required`);
    }
    return { kind: 'expr', expression: value.expression };
  }
  throw new LowCodeContractError(`${path}.kind must be literal, path, or expr`);
}

function parseNode(value: unknown, path: string): LowCodeNode {
  if (!isRecord(value)) {
    throw new LowCodeContractError(`${path} must be an object`);
  }
  assertNoForbiddenKeys(value, path);
  if (typeof value.id !== 'string' || !value.id) {
    throw new LowCodeContractError(`${path}.id is required`);
  }
  if (typeof value.type !== 'string' || !value.type) {
    throw new LowCodeContractError(`${path}.type is required`);
  }
  if (typeof value.componentVersion !== 'string' || !value.componentVersion) {
    throw new LowCodeContractError(`${path}.componentVersion is required`);
  }
  const node: LowCodeNode = {
    id: value.id,
    type: value.type,
    componentVersion: value.componentVersion,
  };
  if (value.visibility === 'hidden' || value.visibility === 'visible') {
    node.visibility = value.visibility;
  }
  if (isRecord(value.props)) {
    node.props = { ...value.props };
  }
  if (isRecord(value.bindings)) {
    node.bindings = Object.fromEntries(
      Object.entries(value.bindings).map(([key, binding]) => [
        key,
        parseBinding(binding, `${path}.bindings.${key}`),
      ]),
    );
  }
  if (Array.isArray(value.children)) {
    node.children = value.children.map((child, index) =>
      parseNode(child, `${path}.children[${String(index)}]`),
    );
  }
  if (isRecord(value.slots)) {
    node.slots = Object.fromEntries(
      Object.entries(value.slots).map(([slot, nodes]) => {
        if (!Array.isArray(nodes)) {
          throw new LowCodeContractError(
            `${path}.slots.${slot} must be an array`,
          );
        }
        return [
          slot,
          nodes.map((child, index) =>
            parseNode(child, `${path}.slots.${slot}[${String(index)}]`),
          ),
        ];
      }),
    );
  }
  return node;
}

export function validateDefinition(
  value: unknown,
): LowCodeApplicationDefinitionVersion {
  if (!isRecord(value)) {
    throw new LowCodeContractError('definition must be an object');
  }
  assertNoForbiddenKeys(value, 'definition');
  if (value.schemaVersion !== LOW_CODE_SCHEMA_VERSION) {
    throw new LowCodeContractError(
      `schemaVersion must be ${LOW_CODE_SCHEMA_VERSION}`,
    );
  }
  for (const field of ['applicationId', 'definitionId', 'version'] as const) {
    if (typeof value[field] !== 'string' || !value[field]) {
      throw new LowCodeContractError(`${field} is required`);
    }
  }
  return {
    schemaVersion: LOW_CODE_SCHEMA_VERSION,
    applicationId: String(value.applicationId),
    definitionId: String(value.definitionId),
    version: String(value.version),
    tree: parseNode(value.tree, 'tree'),
    requirements: isRecord(value.requirements)
      ? {
          capabilities: Array.isArray(value.requirements.capabilities)
            ? value.requirements.capabilities.filter(
                (item): item is string => typeof item === 'string',
              )
            : undefined,
        }
      : undefined,
    runtime: isRecord(value.runtime)
      ? {
          compilerVersionRange:
            typeof value.runtime.compilerVersionRange === 'string'
              ? value.runtime.compilerVersionRange
              : undefined,
        }
      : undefined,
  };
}

export function validateComponentLock(
  definition: LowCodeApplicationDefinitionVersion,
  lock: ExactComponentLock,
): void {
  const visit = (node: LowCodeNode) => {
    const locked = lock.components[node.type];
    if (!locked) {
      throw new LowCodeContractError(
        `component ${node.type} is not in ExactComponentLock`,
      );
    }
    if (locked !== node.componentVersion) {
      throw new LowCodeContractError(
        `component ${node.type} lock ${locked} != ${node.componentVersion}`,
      );
    }
    node.children?.forEach(visit);
    if (node.slots) {
      Object.values(node.slots).forEach((nodes) => nodes.forEach(visit));
    }
  };
  visit(definition.tree);
}

export function readRuntimeSnapshotPayload(
  payload: unknown,
): LowCodeRuntimeSnapshot {
  if (!isRecord(payload)) {
    throw new LowCodeContractError('snapshot payload must be an object');
  }
  const code = payload.code;
  const failed =
    payload.success === false || (typeof code === 'number' && code !== 200);
  if (failed) {
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `runtime snapshot code ${String(code ?? 'unknown')}`;
    throw new LowCodeContractError(message);
  }
  const body = payload.data !== undefined ? payload.data : payload;
  return validateRuntimeSnapshot(body);
}

export function validateRuntimeSnapshot(
  value: unknown,
): LowCodeRuntimeSnapshot {
  if (!isRecord(value) || !isRecord(value.componentLock)) {
    throw new LowCodeContractError('snapshot must include componentLock');
  }
  const components = isRecord(value.componentLock.components)
    ? Object.fromEntries(
        Object.entries(value.componentLock.components).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : {};
  const lock: ExactComponentLock = { components };
  const definition = validateDefinition(value.definition);
  validateComponentLock(definition, lock);
  const resources = Array.isArray(value.resources)
    ? value.resources.flatMap((item) => {
        if (!isRecord(item) || typeof item.id !== 'string') return [];
        return [
          {
            id: item.id,
            kind: typeof item.kind === 'string' ? item.kind : 'unknown',
            href: typeof item.href === 'string' ? item.href : undefined,
          },
        ];
      })
    : [];
  return { definition, componentLock: lock, resources };
}

export function migrateDefinition(
  value: unknown,
): LowCodeApplicationDefinitionVersion {
  return validateDefinition(value);
}
