export interface DagNodePosition {
  x: number;
  y: number;
}

export interface DagNodeConfig {
  config?: Record<string, unknown>;
  downstream?: string[];
  name?: string;
  /** Canvas position; persisted in dagDefinition JSON for reload. */
  position?: DagNodePosition;
  type: string;
  upstream?: string[];
}

export interface DagDefinition {
  nodes: Record<string, DagNodeConfig>;
}
