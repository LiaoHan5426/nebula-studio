export interface DagNodePosition {
  x: number;
  y: number;
}

export interface DagNodeConfig {
  type: string;
  name?: string;
  config?: Record<string, unknown>;
  upstream?: string[];
  downstream?: string[];
  /** Canvas position; persisted in dagDefinition JSON for reload. */
  position?: DagNodePosition;
}

export interface DagDefinition {
  nodes: Record<string, DagNodeConfig>;
}
