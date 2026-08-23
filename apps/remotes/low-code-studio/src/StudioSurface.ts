import type {
  ExactComponentLock,
  LowCodeApplicationDefinitionVersion,
  LowCodeRuntimeContext,
} from '@nebula-studio/low-code-contract';

import { defineComponent, h } from 'vue';

import {
  createTrustedFixtureRegistry,
  LowCodeCompiler,
} from '@nebula-studio/low-code-compiler';

const registry = createTrustedFixtureRegistry();

export const StudioSurface = defineComponent({
  name: 'StudioSurface',
  props: {
    definition: {
      type: Object as () => LowCodeApplicationDefinitionVersion,
      required: true,
    },
    componentLock: {
      type: Object as () => ExactComponentLock,
      required: true,
    },
    context: {
      type: Object as () => LowCodeRuntimeContext,
      required: true,
    },
    mode: {
      type: String as () => 'designer' | 'preview' | 'runtime',
      default: 'runtime',
    },
    eyebrow: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'lc-studio' }, [
        props.eyebrow
          ? h('p', { class: 'lc-studio__eyebrow' }, props.eyebrow)
          : null,
        h(LowCodeCompiler, {
          definition: props.definition,
          componentLock: props.componentLock,
          registry,
          context: props.context,
          mode: props.mode,
        }),
      ]);
  },
});
