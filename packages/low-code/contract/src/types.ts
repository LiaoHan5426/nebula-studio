export const LOW_CODE_SCHEMA_VERSION = 'low-code.definition.v1';

export type LowCodeBinding =
  | { expression: string; kind: 'expr' }
  | { kind: 'literal'; value: unknown }
  | { kind: 'path'; path: string };

export interface LowCodeNode {
  bindings?: Record<string, LowCodeBinding>;
  children?: LowCodeNode[];
  componentVersion: string;
  id: string;
  isolation?: 'host' | 'iframe';
  props?: Record<string, unknown>;
  slots?: Record<string, LowCodeNode[]>;
  type: string;
  visibility?: 'hidden' | 'visible';
}

export interface LowCodeApplicationDefinitionVersion {
  applicationId: string;
  definitionId: string;
  requirements?: { capabilities?: string[] };
  runtime?: { compilerVersionRange?: string };
  schemaVersion: typeof LOW_CODE_SCHEMA_VERSION;
  tree: LowCodeNode;
  version: string;
}

export interface LowCodeDraftDocument extends LowCodeApplicationDefinitionVersion {
  draftId: string;
}

export interface ExactComponentLock {
  components: Record<string, string>;
}

export interface LowCodeResourceRef {
  href?: string;
  id: string;
  kind: string;
}

export interface LowCodeRuntimeSnapshot {
  componentLock: ExactComponentLock;
  definition: LowCodeApplicationDefinitionVersion;
  resources: LowCodeResourceRef[];
}

export interface LowCodeRuntimeContext {
  data: Record<string, unknown>;
}
