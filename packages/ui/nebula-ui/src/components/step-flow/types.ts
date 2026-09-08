export interface NebulaStepItem {
  description?: string;
  id: string;
  label: string;
  state?: 'complete' | 'current' | 'error' | 'pending';
}
