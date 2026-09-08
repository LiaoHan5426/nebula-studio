export interface NebulaTimelineItem {
  description?: string;
  id: string;
  state?: 'complete' | 'current' | 'error' | 'pending';
  timestamp?: string;
  title: string;
}
