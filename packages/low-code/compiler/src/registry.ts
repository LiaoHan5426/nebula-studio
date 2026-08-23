import type { Component } from 'vue';

export interface LowCodeComponentRegistry {
  resolve(type: string, version: string): Component | null;
}
