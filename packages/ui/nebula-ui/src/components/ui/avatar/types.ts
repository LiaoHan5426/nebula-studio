import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarRootProps,
} from 'reka-ui';

import type { HTMLAttributes } from 'vue';

export type AvatarProps = AvatarRootProps & {
  class?: HTMLAttributes['class'];
};

export type AvatarImageComponentProps = AvatarImageProps & {
  class?: HTMLAttributes['class'];
};

export type AvatarFallbackComponentProps = AvatarFallbackProps & {
  class?: HTMLAttributes['class'];
};
