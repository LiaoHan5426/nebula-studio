import type { QueryResult } from '../types';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'table' | 'area';

export type ColumnInfo = {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  isNumeric: boolean;
};

export type ChartRecommendation = {
  chartType: ChartType;
  reason: string;
  xAxis?: string;
  yAxis?: string[];
  series?: string[];
};

export class ChartSelector {
  analyzeColumns(
    columns: string[],
    rows: Record<string, unknown>[],
  ): ColumnInfo[] {
    return columns.map((name) => {
      const sampleValue = rows[0]?.[name];
      let type: ColumnInfo['type'] = 'string';
      let isNumeric = false;

      if (sampleValue !== undefined) {
        if (typeof sampleValue === 'number') {
          type = 'number';
          isNumeric = true;
        } else if (typeof sampleValue === 'boolean') {
          type = 'boolean';
        } else if (!isNaN(Date.parse(String(sampleValue)))) {
          type = 'date';
        }
      }

      return { name, type, isNumeric };
    });
  }

  recommendChart(result: QueryResult): ChartRecommendation {
    const { columns, rows } = result;

    if (rows.length === 0) {
      return { chartType: 'table', reason: 'No data available' };
    }

    const columnInfo = this.analyzeColumns(columns, rows);
    const numericColumns = columnInfo.filter((c) => c.isNumeric);
    const stringColumns = columnInfo.filter((c) => c.type === 'string');
    const dateColumns = columnInfo.filter((c) => c.type === 'date');

    if (
      columns.length === 2 &&
      numericColumns.length === 1 &&
      stringColumns.length === 1
    ) {
      const xAxis = stringColumns[0]?.name ?? '';
      const yAxis = numericColumns[0]?.name ?? '';
      return {
        chartType: 'bar',
        reason:
          'Two columns: one category, one numeric - bar chart is suitable',
        xAxis,
        yAxis: [yAxis],
      };
    }

    if (columns.length === 2 && numericColumns.length === 2) {
      return {
        chartType: 'scatter',
        reason: 'Two numeric columns - scatter plot is suitable',
        xAxis: numericColumns[0]?.name ?? '',
        yAxis: [numericColumns[1]?.name ?? ''],
      };
    }

    if (numericColumns.length >= 1 && stringColumns.length >= 1) {
      const xAxis = stringColumns[0]?.name ?? dateColumns[0]?.name;
      return {
        chartType: 'bar',
        reason:
          'Multiple numeric columns with categories - bar chart is suitable',
        xAxis,
        yAxis: numericColumns.map((c) => c.name),
      };
    }

    if (dateColumns.length >= 1 && numericColumns.length >= 1) {
      return {
        chartType: 'line',
        reason:
          'Date column with numeric values - line chart is suitable for trends',
        xAxis: dateColumns[0]?.name ?? '',
        yAxis: numericColumns.map((c) => c.name),
      };
    }

    if (rows.length <= 10 && columns.length <= 5) {
      return {
        chartType: 'table',
        reason: 'Small dataset - table view is suitable',
      };
    }

    const firstColumn = columns[0] ?? '';
    const distinctValues = new Set(rows.map((r) => r[firstColumn])).size;
    if (distinctValues <= 7 && numericColumns.length >= 1) {
      return {
        chartType: 'pie',
        reason:
          'Limited categories with numeric values - pie chart is suitable',
        xAxis: firstColumn,
        yAxis: numericColumns.slice(0, 1).map((c) => c.name),
      };
    }

    return {
      chartType: 'bar',
      reason: 'Default: bar chart for general data visualization',
      xAxis: firstColumn,
      yAxis:
        numericColumns.length > 0
          ? numericColumns.map((c) => c.name)
          : columns.slice(1),
    };
  }
}
