import type { QueryResult } from '../types';
import type { ChartRecommendation, ChartType } from '../chart-selector';

export type EChartsOption = {
  title?: {
    text: string;
    left?: string;
  };
  tooltip?: {
    trigger?: string;
  };
  legend?: {
    data?: string[];
    bottom?: string;
  };
  xAxis?: {
    type: string;
    data?: string[] | number[];
    name?: string;
  };
  yAxis?: {
    type: string;
    name?: string;
  }[] | {
    type: string;
    name?: string;
  };
  series?: Array<{
    name?: string;
    type: ChartType;
    data?: unknown[];
    barGap?: string;
  }>;
  table?: {
    data?: unknown[][];
    columns?: {
      name: string;
    }[];
  };
};

export class EChartsGenerator {
  generateOption(result: QueryResult, recommendation: ChartRecommendation): EChartsOption {
    const { columns, rows } = result;
    const { chartType, xAxis, yAxis } = recommendation;

    switch (chartType) {
      case 'bar':
        return this.generateBarOption(columns, rows, xAxis, yAxis || []);
      case 'line':
        return this.generateLineOption(columns, rows, xAxis, yAxis || []);
      case 'pie':
        return this.generatePieOption(columns, rows, xAxis, yAxis?.[0]);
      case 'scatter':
        return this.generateScatterOption(columns, rows, xAxis, yAxis || []);
      case 'area':
        return this.generateAreaOption(columns, rows, xAxis, yAxis || []);
      case 'table':
      default:
        return this.generateTableOption(columns, rows);
    }
  }

  private generateBarOption(columns: string[], rows: Record<string, unknown>[], xAxis?: string, yAxis: string[] = []) {
    const xField = xAxis ?? columns[0] ?? '';
    const yFields = yAxis.length > 0 ? yAxis : columns.slice(1);

    return {
      title: { text: 'Bar Chart', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: yFields, bottom: '0%' },
      xAxis: { type: 'category', data: rows.map(r => String(r[xField])), name: xField || undefined },
      yAxis: { type: 'value' },
      series: yFields.map(field => ({
        name: field,
        type: 'bar' as ChartType,
        data: rows.map(r => r[field]),
        barGap: '10%'
      }))
    };
  }

  private generateLineOption(columns: string[], rows: Record<string, unknown>[], xAxis?: string, yAxis: string[] = []) {
    const xField = xAxis ?? columns[0] ?? '';
    const yFields = yAxis.length > 0 ? yAxis : columns.slice(1);

    return {
      title: { text: 'Line Chart', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: yFields, bottom: '0%' },
      xAxis: { type: 'category', data: rows.map(r => String(r[xField])), name: xField || undefined },
      yAxis: { type: 'value' },
      series: yFields.map(field => ({
        name: field,
        type: 'line' as ChartType,
        data: rows.map(r => r[field])
      }))
    };
  }

  private generatePieOption(columns: string[], rows: Record<string, unknown>[], xAxis?: string, yAxis?: string) {
    const xField = xAxis ?? columns[0] ?? '';
    const yField = yAxis ?? columns[1] ?? '';

    return {
      title: { text: 'Pie Chart', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [{
        name: yField,
        type: 'pie' as ChartType,
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        data: rows.map(r => ({
          name: String(r[xField]),
          value: r[yField]
        }))
      }]
    };
  }

  private generateScatterOption(columns: string[], rows: Record<string, unknown>[], xAxis?: string, yAxis: string[] = []) {
    const xField = xAxis ?? columns[0] ?? '';
    const yField = yAxis[0] ?? columns[1] ?? '';

    return {
      title: { text: 'Scatter Plot', left: 'center' },
      tooltip: { trigger: 'item' },
      xAxis: { type: 'value', name: xField || undefined },
      yAxis: { type: 'value', name: yField || undefined },
      series: [{
        name: 'Data Points',
        type: 'scatter' as ChartType,
        data: rows.map(r => [r[xField], r[yField]])
      }]
    };
  }

  private generateAreaOption(columns: string[], rows: Record<string, unknown>[], xAxis?: string, yAxis: string[] = []) {
    const xField = xAxis ?? columns[0] ?? '';
    const yFields = yAxis.length > 0 ? yAxis : columns.slice(1);

    return {
      title: { text: 'Area Chart', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: yFields, bottom: '0%' },
      xAxis: { type: 'category', data: rows.map(r => String(r[xField])), name: xField || undefined },
      yAxis: { type: 'value' },
      series: yFields.map(field => ({
        name: field,
        type: 'area' as ChartType,
        data: rows.map(r => r[field])
      }))
    };
  }

  private generateTableOption(columns: string[], rows: Record<string, unknown>[]) {
    return {
      title: { text: 'Data Table', left: 'center' },
      table: {
        columns: columns.map(name => ({ name })),
        data: rows.map(row => columns.map(col => row[col]))
      }
    };
  }
}