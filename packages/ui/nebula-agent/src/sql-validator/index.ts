import { Parser } from 'node-sql-parser';

export type ParseResult = {
  type?: string;
  from?: Array<{ table?: string }>;
  columns?: Array<{ expr?: { column?: string } }>;
  [key: string]: unknown;
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
  ast?: ParseResult;
  tables?: string[];
  columns?: string[];
};

export type SQLValidatorOptions = {
  database?: string;
  allowedTables?: string[];
  allowedColumns?: Record<string, string[]>;
  disallowedStatements?: string[];
};

export type ParserExtension = {
  database: string;
  keywords?: string[];
  functions?: string[];
  customRules?: (sql: string) => ValidationResult;
};

export class SQLValidator {
  private parser: Parser;
  private options: SQLValidatorOptions;
  private extensions: Map<string, ParserExtension>;

  constructor(options: SQLValidatorOptions = {}) {
    this.options = {
      database: 'mysql',
      disallowedStatements: [
        'DELETE',
        'UPDATE',
        'INSERT',
        'DROP',
        'TRUNCATE',
        'ALTER',
        'CREATE',
      ],
      ...options,
    };
    this.parser = new Parser();
    this.extensions = new Map();
  }

  validate(sql: string): ValidationResult {
    try {
      const astResult = this.parser.astify(sql, {
        database: this.options.database,
      });
      const ast = Array.isArray(astResult)
        ? (astResult[0] as unknown as ParseResult)
        : (astResult as unknown as ParseResult);

      const tables = this.extractTables(ast);
      const columns = this.extractColumns(ast);

      if (this.options.allowedTables && tables.length > 0) {
        const invalidTables = tables.filter(
          (t) => !this.options.allowedTables?.includes(t),
        );
        if (invalidTables.length > 0) {
          return {
            isValid: false,
            error: `Tables not allowed: ${invalidTables.join(', ')}`,
            tables,
          };
        }
      }

      const statementType = this.getStatementType(ast);
      if (this.options.disallowedStatements?.includes(statementType)) {
        return {
          isValid: false,
          error: `Statement type not allowed: ${statementType}`,
          ast,
          tables,
          columns,
        };
      }

      for (const [, extension] of this.extensions) {
        if (extension.customRules) {
          const result = extension.customRules(sql);
          if (!result.isValid) {
            return result;
          }
        }
      }

      return {
        isValid: true,
        ast,
        tables,
        columns,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid SQL syntax',
      };
    }
  }

  registerExtension(extension: ParserExtension): void {
    this.extensions.set(extension.database, extension);

    if (extension.keywords) {
      // 扩展解析器关键字
    }

    if (extension.functions) {
      // 扩展解析器函数
    }
  }

  private extractTables(ast: ParseResult): string[] {
    const tables: string[] = [];

    if (typeof ast === 'object' && ast !== null) {
      if ('from' in ast && Array.isArray(ast.from)) {
        ast.from.forEach((item: { table?: string }) => {
          if (item.table) {
            tables.push(item.table);
          }
        });
      }
    }

    return tables;
  }

  private extractColumns(ast: ParseResult): string[] {
    const columns: string[] = [];

    if (typeof ast === 'object' && ast !== null) {
      if ('columns' in ast && Array.isArray(ast.columns)) {
        ast.columns.forEach((col: { expr?: { column?: string } }) => {
          if (col.expr?.column) {
            columns.push(col.expr.column);
          }
        });
      }
    }

    return columns;
  }

  private getStatementType(ast: ParseResult): string {
    if (typeof ast === 'object' && ast !== null && 'type' in ast) {
      return String(ast.type).toUpperCase();
    }
    return 'UNKNOWN';
  }

  getTableList(sql: string): string[] {
    const result = this.validate(sql);
    return result.tables || [];
  }
}
