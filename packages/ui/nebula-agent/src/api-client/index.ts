export type ApiClientConfig = {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
};

export type QueryResult = {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export type TableSchema = {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
  }>;
};

export type ExecuteSQLRequest = {
  sql: string;
  encrypted?: boolean;
};

export type ExecuteSQLResponse = {
  success: boolean;
  data?: QueryResult;
  error?: string;
};

export type GetSchemaResponse = {
  success: boolean;
  data?: TableSchema[];
  error?: string;
};

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  async executeSQL(
    sql: string,
    encrypted: boolean = false,
  ): Promise<ExecuteSQLResponse> {
    try {
      const requestBody: ExecuteSQLRequest = {
        sql,
        encrypted,
      };

      const response = await fetch(`${this.config.baseURL}/sql/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getSchema(): Promise<GetSchemaResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/sql/schema`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  formatSchemaForPrompt(schema: TableSchema[]): string {
    return schema
      .map((table) => {
        const columns = table.columns
          .map(
            (col) =>
              `    ${col.name} ${col.type}${col.primaryKey ? ' PRIMARY KEY' : ''}${col.nullable ? '' : ' NOT NULL'}`,
          )
          .join('\n');
        return `TABLE ${table.name} (\n${columns}\n)`;
      })
      .join('\n\n');
  }
}
