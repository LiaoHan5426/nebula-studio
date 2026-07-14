/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string;
  export default content;
}

declare module '*?demo' {
  import type { Component } from 'vue';

  const demo: {
    component: Component;
    source: string;
  };

  export default demo;
  export const component: Component;
  export const source: string;
}
