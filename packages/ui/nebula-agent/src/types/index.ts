export type QueryResult = {
  columns: string[];
  rowCount: number;
  rows: Record<string, unknown>[];
};

export type DatabaseConfig = {
  database: string;
  host: string;
  password: string;
  port: number;
  type: string;
  username: string;
};
