export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export type DatabaseConfig = {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};
