import { describe, expect, it } from 'vitest';

import { resolveNebulaManualChunks } from '../config/chunks/index.ts';

describe('nebula editor chunk rules', () => {
  const chunks = resolveNebulaManualChunks({ enabled: true });

  it('splits BPMN, Monaco, and VXE out of the app entry', () => {
    expect(chunks?.('/node_modules/bpmn-js/lib/Modeler.js')).toBe(
      'editor-flow',
    );
    expect(
      chunks?.('/packages/editors/flow-editor/src/components/BpmnEditor.vue'),
    ).toBe('editor-flow');
    expect(
      chunks?.('/node_modules/monaco-editor/esm/vs/editor/editor.main.js'),
    ).toBe('editor-code');
    expect(chunks?.('/node_modules/vxe-pc-ui/es/index.js')).toBe('vendor-vxe');
  });
});
