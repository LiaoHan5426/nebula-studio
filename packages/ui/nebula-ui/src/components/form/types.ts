import type { InjectionKey } from 'vue';

export interface NebulaFormControlProps {
  ariaDescribedby?: string;
  ariaLabelledby?: string;
  id?: string;
  invalid?: boolean;
  name?: string;
  required?: boolean;
}

export type NebulaFormValues = Record<string, unknown>;

/** Field rule: `true` / `undefined` means valid; a string is the error message. */
export type NebulaFormRule = (value: unknown) => string | true | undefined;

/** Zod 4 (or any Standard Schema) object passed to TanStack Form. */
export type NebulaFormSchema = {
  readonly '~standard': unknown;
};

export type NebulaFormApi = {
  Field: object;
  handleSubmit: () => unknown;
  reset: () => void;
  state: {
    errorMap: unknown;
    values: NebulaFormValues;
  };
};

export const nebulaFormContextKey: InjectionKey<NebulaFormApi> =
  Symbol('nebulaForm');

export function firstFormError(errors: unknown[]): string {
  const first = errors[0];
  if (first === null) {
    return '';
  }
  if (typeof first === 'string') {
    return first;
  }
  if (typeof first === 'object' && first && 'message' in first) {
    const message = (first as { message?: unknown }).message;
    if (typeof message === 'string' && message) {
      return message;
    }
  }
  return '';
}
