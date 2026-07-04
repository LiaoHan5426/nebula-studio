export interface PluginNodeField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: unknown;
}

export interface PluginNodeSchema {
  label?: string;
  fields?: PluginNodeField[];
}
