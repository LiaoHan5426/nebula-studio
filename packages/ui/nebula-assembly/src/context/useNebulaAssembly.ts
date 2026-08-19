import type { NebulaAssemblyContext } from '../types/context';

import { inject } from 'vue';

import { nebulaAssemblyKey } from '../types/context';

export function useNebulaAssembly(): NebulaAssemblyContext {
  const context = inject(nebulaAssemblyKey);
  if (!context) {
    throw new Error(
      'useNebulaAssembly() called without provideNebulaAssembly(). Install assembly at app boot.',
    );
  }
  return context;
}

export function tryUseNebulaAssembly(): NebulaAssemblyContext | undefined {
  return inject(nebulaAssemblyKey);
}

export function useEditorHost() {
  return useNebulaAssembly().editor;
}

export function tryUseEditorHost() {
  return tryUseNebulaAssembly()?.editor;
}
