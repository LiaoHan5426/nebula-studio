import type { editor } from 'monaco-editor';
import type { EditorError, EditorLifecycleHooks } from '../types';

type EditorInstance =
  | editor.IStandaloneCodeEditor
  | editor.IStandaloneDiffEditor;

type EditorLifecycleHookArgs = {
  beforeCreate: [];
  onCreating: [];
  onCreated: [editor: EditorInstance];
  onReady: [editor: EditorInstance];
  beforeDestroy: [];
  onDestroyed: [];
  onError: [error: EditorError];
  onRecover: [];
};

/**
 * Lifecycle hook management
 */
export const useEditorLifecycle = (hooks?: EditorLifecycleHooks) => {
  const hookExecutors: {
    [HookName in keyof EditorLifecycleHookArgs]: (
      ...args: EditorLifecycleHookArgs[HookName]
    ) => void | Promise<void>;
  } = {
    beforeCreate: () => hooks?.beforeCreate?.(),
    onCreating: () => hooks?.onCreating?.(),
    onCreated: (editorInstance) => hooks?.onCreated?.(editorInstance),
    onReady: (editorInstance) => hooks?.onReady?.(editorInstance),
    beforeDestroy: () => hooks?.beforeDestroy?.(),
    onDestroyed: () => hooks?.onDestroyed?.(),
    onError: (error) => hooks?.onError?.(error),
    onRecover: () => hooks?.onRecover?.(),
  };

  const executeHook = async <HookName extends keyof EditorLifecycleHookArgs>(
    hookName: HookName,
    ...args: EditorLifecycleHookArgs[HookName]
  ) => {
    try {
      await hookExecutors[hookName](...args);
    } catch (error) {
      hooks?.onError?.({
        code: 'LIFECYCLE_ERROR',
        message: `Error in ${hookName} hook`,
        details: error instanceof Error ? error.message : String(error),
        recoverable: true,
      });
    }
  };

  return { executeHook };
};
