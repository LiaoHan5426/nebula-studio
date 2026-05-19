import { ref } from 'vue';
import type { EditorError, EditorLoadingState } from '../types';
import { warnMsg } from '../utils';

/**
 * General editor error handling and state management Hook
 */
export const useEditorState = () => {
  const loading = ref<EditorLoadingState>({
    isLoading: false,
    loadingText: 'Loading Monaco Editor...',
    progress: 0,
  });

  const error = ref<EditorError | null>(null);
  const isReady = ref(false);

  const setLoading = (state: Partial<EditorLoadingState>) => {
    loading.value = { ...loading.value, ...state };
  };

  const setError = (err: EditorError | null) => {
    error.value = err;
    if (err) {
      warnMsg(`Editor Error [${err.code}]: ${err.message}`);
      if (err.details) {
        console.error('Error details:', err.details);
      }
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const setReady = (ready: boolean) => {
    isReady.value = ready;
    if (ready) {
      setLoading({ isLoading: false, progress: 100 });
    }
  };

  return {
    loading,
    error,
    isReady,
    setLoading,
    setError,
    clearError,
    setReady,
  };
};
