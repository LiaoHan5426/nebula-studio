import '../workers';

import { editor } from 'monaco-editor';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type {
  MonacoEditorProps,
  UseDiffEditorReturn,
  EditorError,
  EditorLifecycleHooks,
} from '../types';
import { useEditorState } from './use-editor-state';
import { useEditorLifecycle } from './use-editor-lifecycle';

type DiffEditorEmit = {
  (event: 'editorWillMount'): void;
  (event: 'editorDidMount', editorInstance: editor.IStandaloneDiffEditor): void;
  (
    event: 'change',
    value: string,
    changeEvent: editor.IModelContentChangedEvent,
  ): void;
  (event: 'update:value', value: string): void;
};

export const useDiffEditor = (
  props: MonacoEditorProps & { lifecycle?: EditorLifecycleHooks },
  emit: DiffEditorEmit,
): UseDiffEditorReturn => {
  let editorInstance: editor.IStandaloneDiffEditor | null = null;
  const container = ref<HTMLElement>();
  const {
    loading,
    error,
    isReady,
    setLoading,
    setError,
    clearError,
    setReady,
  } = useEditorState();
  const { executeHook } = useEditorLifecycle(props.lifecycle);

  const createEditor = async () => {
    try {
      if (!container.value) {
        throw new Error('Container element not found');
      }

      await executeHook('beforeCreate');
      setLoading({ isLoading: true, progress: 20 });

      await executeHook('onCreating');
      emit('editorWillMount');

      setLoading({ progress: 50 });

      const options = {
        value: props.value,
        language: props.language,
        theme: props.theme,
        ...props.options,
      };

      editorInstance = editor.createDiffEditor(
        container.value,
        options,
      ) as editor.IStandaloneDiffEditor;

      setLoading({ progress: 70 });

      // Generate models for diff
      const originalModel = editor.createModel(
        props.original ?? '',
        props.language,
      );
      const modifiedModel = editor.createModel(
        props.value ?? '',
        props.language,
      );
      editorInstance.setModel({
        original: originalModel,
        modified: modifiedModel,
      });

      setLoading({ progress: 80 });
      await executeHook('onCreated', editorInstance);

      // Register diffEditor content change listener
      const modifiedEditor = editorInstance.getModifiedEditor();
      modifiedEditor.onDidChangeModelContent((event) => {
        const value = modifiedEditor.getValue();
        if (props.value !== value) {
          emit('change', value, event);
          emit('update:value', value);
        }
      });

      setReady(true);
      await executeHook('onReady', editorInstance);
      emit('editorDidMount', editorInstance);
    } catch (err) {
      const editorError: EditorError = {
        code: 'DIFF_EDITOR_CREATE_FAILED',
        message: 'Failed to create Monaco diff editor',
        details: err instanceof Error ? err.message : String(err),
        recoverable: true,
      };
      setError(editorError);
      await executeHook('onError', editorError);
    }
  };

  const destroyEditor = async () => {
    try {
      await executeHook('beforeDestroy');

      if (editorInstance) {
        editorInstance.dispose();
        editorInstance = null;
      }

      setReady(false);
      clearError();
      await executeHook('onDestroyed');
    } catch (err) {
      const editorError: EditorError = {
        code: 'DIFF_EDITOR_DESTROY_FAILED',
        message: 'Failed to destroy Monaco diff editor',
        details: err instanceof Error ? err.message : String(err),
        recoverable: false,
      };
      setError(editorError);
    }
  };

  onMounted(() => {
    nextTick(() => {
      createEditor();
    });
  });

  onUnmounted(() => {
    destroyEditor();
  });

  // Watch for original and value changes
  watch(
    [() => props.original, () => props.value],
    ([newOriginal, newValue]) => {
      if (!editorInstance) return;
      try {
        const model = editorInstance.getModel();
        if (model) {
          if (newOriginal !== undefined) {
            model.original.setValue(newOriginal);
          }
          if (newValue !== undefined) {
            model.modified.setValue(newValue);
          }
        }
      } catch (err) {
        const editorError: EditorError = {
          code: 'DIFF_VALUE_UPDATE_FAILED',
          message: 'Failed to update diff editor values',
          details: err instanceof Error ? err.message : String(err),
          recoverable: true,
        };
        setError(editorError);
      }
    },
  );

  const retry = () => {
    clearError();
    createEditor();
  };

  return {
    editorInstance,
    container,
    loading,
    error,
    isReady,
    retry,
    destroy: destroyEditor,
  };
};
