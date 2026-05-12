import type { Component } from 'vue';

export interface DocsFeatureDefinition {
  id: string;
  title: string;
  description?: string;
  menuPath?: string[];
  order?: number;
  component: Component;
}

export interface FeatureMenuNode {
  key: string;
  title: string;
  children: FeatureMenuNode[];
  featureId?: string;
}
