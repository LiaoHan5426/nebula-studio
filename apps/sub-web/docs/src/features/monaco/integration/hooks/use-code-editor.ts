import '../workers';

import { editor } from 'monaco-editor';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type {
  CodeEditorProps,
  UseCodeEditorReturn,
  EditorError,
  EditorLifecycleHooks,
} from '../types';
import { useEditorState } from './use-editor-state';
import { useEditorLifecycle } from './use-editor-lifecycle';

type CodeEditorEmit = {
  (event: 'editorWillMount'): void;
  (event: 'editorDidMount', editorInstance: editor.IStandaloneCodeEditor): void;
  (
    event: 'change',
    value: string,
    changeEvent: editor.IModelContentChangedEvent,
  ): void;
  (event: 'update:value', value: string): void;
};

export const useCodeEditor = (
  props: CodeEditorProps & { lifecycle?: EditorLifecycleHooks },
  emit: CodeEditorEmit,
): UseCodeEditorReturn => {
  let editorInstance: editor.IStandaloneCodeEditor | null = null;
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

      editorInstance = editor.create(
        container.value,
        options,
      ) as editor.IStandaloneCodeEditor;

      setLoading({ progress: 80 });
      await executeHook('onCreated', editorInstance);

      // Register content change listener
      const codeEditor = editorInstance;
      codeEditor.onDidChangeModelContent((event) => {
        const value = codeEditor.getValue();
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
        code: 'EDITOR_CREATE_FAILED',
        message: 'Failed to create Monaco editor',
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
        code: 'EDITOR_DESTROY_FAILED',
        message: 'Failed to destroy Monaco editor',
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

  // Watch for changes in options and update synchronously
  watch(
    () => props.options,
    (opt) => {
      if (!opt || !editorInstance) return;
      try {
        editorInstance.updateOptions(opt);
      } catch (err) {
        const editorError: EditorError = {
          code: 'OPTIONS_UPDATE_FAILED',
          message: 'Failed to update editor options',
          details: err instanceof Error ? err.message : String(err),
          recoverable: true,
        };
        setError(editorError);
      }
    },
    {
      deep: true,
    },
  );

  // Watch for value changes
  watch(
    () => props.value,
    (newValue) => {
      if (!editorInstance || newValue === undefined) return;
      const currentValue = editorInstance.getValue();
      if (currentValue !== newValue) {
        try {
          editorInstance.setValue(newValue);
        } catch (err) {
          const editorError: EditorError = {
            code: 'VALUE_UPDATE_FAILED',
            message: 'Failed to update editor value',
            details: err instanceof Error ? err.message : String(err),
            recoverable: true,
          };
          setError(editorError);
        }
      }
    },
  );

  watch(
    () => props.language,
    (language) => {
      if (!editorInstance || !language) return;

      try {
        const model = editorInstance.getModel();
        if (model) {
          editor.setModelLanguage(model, language);
        }
      } catch (err) {
        const editorError: EditorError = {
          code: 'LANGUAGE_UPDATE_FAILED',
          message: 'Failed to update editor language',
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
