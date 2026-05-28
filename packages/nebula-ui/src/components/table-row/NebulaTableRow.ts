import { defineComponent, h } from 'vue';
import { VxeColgroup } from 'vxe-table';

export const NebulaTableRow = defineComponent({
  name: 'NebulaTableRow',
  props: {
    title: {
      type: String,
      default: '',
    },
    align: {
      type: String as () => 'left' | 'center' | 'right' | '',
      default: '',
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        VxeColgroup as unknown as object,
        {
          title: props.title || undefined,
          align: props.align || undefined,
        },
        slots,
      );
  },
});
