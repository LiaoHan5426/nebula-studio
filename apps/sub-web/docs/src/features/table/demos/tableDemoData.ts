export interface DemoRow {
  id: number;
  module: string;
  owner: string;
  status: 'ready' | 'reviewing' | 'blocked';
  score: number;
  updatedAt: string;
}

export function createTableDemoRows(): DemoRow[] {
  return Array.from({ length: 18 }, (_, index) => {
    const id = index + 1;
    const statuses: DemoRow['status'][] = ['ready', 'reviewing', 'blocked'];
    const owners = ['Liao', 'Nebula', 'Studio'];
    return {
      id,
      module: `feature-${String(id).padStart(2, '0')}`,
      owner: owners[index % owners.length] ?? 'Unknown',
      status: statuses[index % statuses.length] ?? 'ready',
      score: 70 + ((index * 7) % 31),
      updatedAt: `2026-05-${String((index % 9) + 10)}`,
    };
  });
}
