import { getAgentConfig } from '../../config';
import { LLMClient } from '../../llm';
import {
  ApiClient,
  type ApiClientConfig,
  type QueryResult,
  type ExecuteSQLResponse,
} from '../../api-client';
import { SQLCrypto, type CryptoConfig } from '../../crypto';
import { ChartSelector, type ChartRecommendation } from '../../chart-selector';
import { EChartsGenerator, type EChartsOption } from '../../echarts-generator';
import { buildPrompt } from '../../prompt-builder';
import {
  SQLValidator,
  type ValidationResult,
  type ParserExtension,
  type SQLValidatorOptions,
} from '../../sql-validator';

export type SQLAgentResult = {
  userQuery: string;
  generatedSQL: string;
  validationResult: ValidationResult;
  queryResult: QueryResult;
  chartRecommendation: ChartRecommendation;
  echartsOption: EChartsOption;
};

export type SQLAgentOptions = {
  apiConfig?: ApiClientConfig;
  cryptoConfig?: CryptoConfig;
  validatorOptions?: SQLValidatorOptions;
  parserExtensions?: ParserExtension[];
  encryptSQL?: boolean;
};

export class SQLAgent {
  private llmClient: LLMClient;
  private apiClient: ApiClient;
  private crypto: SQLCrypto;
  private chartSelector: ChartSelector;
  private echartsGenerator: EChartsGenerator;
  private validator: SQLValidator;
  private encryptSQL: boolean;

  constructor(options?: SQLAgentOptions) {
    const agentConfig = getAgentConfig('sql-agent');
    if (!agentConfig) {
      throw new Error('SQL agent config not found');
    }

    this.llmClient = new LLMClient(agentConfig);
    this.apiClient = new ApiClient(options?.apiConfig || {
      baseURL: '/api'
    });
    this.crypto = new SQLCrypto(options?.cryptoConfig);
    this.chartSelector = new ChartSelector();
    this.echartsGenerator = new EChartsGenerator();
    this.validator = new SQLValidator(options?.validatorOptions);
    this.encryptSQL = options?.encryptSQL ?? true;

    if (options?.parserExtensions) {
      options.parserExtensions.forEach(ext => {
        this.validator.registerExtension(ext);
      });
    }
  }

  async execute(userQuery: string): Promise<SQLAgentResult> {
    const schema = await this.apiClient.getSchema();
    
    const systemPrompt = await buildPrompt('sql', {
      sql: {
        dbType: 'mysql',
        schema: schema.success ? this.apiClient.formatSchemaForPrompt(schema.data || []) : ''
      }
    });

    const generatedSQL = await this.llmClient.generateSQL(userQuery, systemPrompt);
    
    const validationResult = this.validator.validate(generatedSQL);
    if (!validationResult.isValid) {
      throw new Error(`SQL validation failed: ${validationResult.error}`);
    }
    
    const queryResult = await this.executeSQL(generatedSQL);
    
    const chartRecommendation = this.chartSelector.recommendChart(queryResult);
    
    const echartsOption = this.echartsGenerator.generateOption(queryResult, chartRecommendation);

    return {
      userQuery,
      generatedSQL,
      validationResult,
      queryResult,
      chartRecommendation,
      echartsOption
    };
  }

  async generateSQL(userQuery: string): Promise<string> {
    const schema = await this.apiClient.getSchema();
    const systemPrompt = await buildPrompt('sql', {
      sql: {
        dbType: 'mysql',
        schema: schema.success ? this.apiClient.formatSchemaForPrompt(schema.data || []) : ''
      }
    });
    return this.llmClient.generateSQL(userQuery, systemPrompt);
  }

  async executeSQL(sql: string): Promise<QueryResult> {
    let sqlToExecute = sql;
    
    if (this.encryptSQL) {
      sqlToExecute = await this.crypto.encrypt(sql);
    }
    
    const response: ExecuteSQLResponse = await this.apiClient.executeSQL(
      sqlToExecute,
      this.encryptSQL
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Query execution failed');
    }
    
    return response.data;
  }

  validateSQL(sql: string): ValidationResult {
    return this.validator.validate(sql);
  }

  registerParserExtension(extension: ParserExtension): void {
    this.validator.registerExtension(extension);
  }

  getValidator(): SQLValidator {
    return this.validator;
  }
}