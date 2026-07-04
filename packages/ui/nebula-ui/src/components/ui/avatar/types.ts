import type { HTMLAttributes } from 'vue';
import type {
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
} from 'reka-ui';

export type AvatarProps = AvatarRootProps & {
  class?: HTMLAttributes['class'];
};

export type AvatarImageComponentProps = AvatarImageProps & {
  class?: HTMLAttributes['class'];
};

export type AvatarFallbackComponentProps = AvatarFallbackProps & {
  class?: HTMLAttributes['class'];
};
