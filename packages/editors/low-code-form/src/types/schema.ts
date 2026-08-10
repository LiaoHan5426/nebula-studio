export interface PluginNodeField {
  defaultValue?: unknown;
  key: string;
  label: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  type: 'boolean' | 'number' | 'select' | 'text';
}

export interface PluginNodeSchema {
  fields?: PluginNodeField[];
  label?: string;
}
