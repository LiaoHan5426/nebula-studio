export type WorkspaceItemTone =
  | 'danger'
  | 'info'
  | 'neutral'
  | 'success'
  | 'warning';

export interface WorkspaceLink {
  description?: string;
  icon?: string;
  id: string;
  meta?: string;
  path?: string;
  title: string;
  tone?: WorkspaceItemTone;
  viewId?: string;
}

export interface WorkspaceSummary {
  action?: WorkspaceLink;
  description: string;
  id: 'incidents' | 'requests' | 'resources' | 'tasks';
  label: string;
  tone?: WorkspaceItemTone;
  value: number;
}

export interface WorkspaceModel {
  commonResources: WorkspaceLink[];
  quickActions: WorkspaceLink[];
  recent: WorkspaceLink[];
  summaries: WorkspaceSummary[];
}

export type GlobalSearchKind = 'action' | 'app' | 'document' | 'resource';

export interface GlobalSearchItem extends WorkspaceLink {
  keywords?: string[];
  kind: GlobalSearchKind;
  roles?: string[];
}
