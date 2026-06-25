import { computed } from 'vue';

export function useBooleanModel(
  getValue: () => boolean,
  setValue: (next: boolean) => void,
) {
  return computed<boolean>({
    get: () => Boolean(getValue()),
    set: (next) => setValue(Boolean(next)),
  });
}
