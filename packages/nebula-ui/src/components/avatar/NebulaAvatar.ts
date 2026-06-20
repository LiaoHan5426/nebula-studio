import { computed, defineComponent, h } from 'vue';
import { cn } from '../../utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

export const NebulaAvatar = defineComponent({
  name: 'NebulaAvatar',
  props: {
    src: {
      type: String,
      default: '',
    },
    alt: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    size: {
      type: String as () => AvatarSize,
      default: 'md',
    },
    online: {
      type: Boolean,
      default: false,
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const fallbackText = computed(() => {
      const raw = props.text.trim() || props.alt.trim();
      if (!raw) return '?';
      return raw.slice(0, 1).toUpperCase();
    });

    return () =>
      h(
        'span',
        {
          class: cn(
            'nebula-avatar',
            `nebula-avatar--${props.size}`,
            props.class,
          ),
        },
        [
          props.src
            ? h('img', {
                class: 'nebula-avatar__img',
                src: props.src,
                alt: props.alt || props.text,
              })
            : h(
                'span',
                { class: 'nebula-avatar__fallback' },
                fallbackText.value,
              ),
          props.online &&
            h('span', {
              class: 'nebula-avatar__status',
              'aria-hidden': 'true',
            }),
        ],
      );
  },
});
