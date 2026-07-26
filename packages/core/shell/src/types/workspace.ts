export type WorkspaceItemTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

export interface WorkspaceLink {
  id: string;
  title: string;
  description?: string;
  viewId?: string;
  path?: string;
  icon?: string;
  tone?: WorkspaceItemTone;
  meta?: string;
}

export interface WorkspaceSummary {
  id: 'requests' | 'tasks' | 'incidents' | 'resources';
  label: string;
  value: number;
  description: string;
  tone?: WorkspaceItemTone;
  action?: WorkspaceLink;
}

export interface WorkspaceModel {
  recent: WorkspaceLink[];
  summaries: WorkspaceSummary[];
  commonResources: WorkspaceLink[];
  quickActions: WorkspaceLink[];
}

export type GlobalSearchKind = 'app' | 'resource' | 'document' | 'action';

export interface GlobalSearchItem extends WorkspaceLink {
  kind: GlobalSearchKind;
  keywords?: string[];
  roles?: string[];
}
