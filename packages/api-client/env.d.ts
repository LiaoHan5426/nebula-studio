/// <reference types="vite/client" />

declare module 'nprogress' {
  interface NProgressOptions {
    minimum?: number;
    trickleSpeed?: number;
    showSpinner?: boolean;
  }

  interface NProgress {
    configure(options: NProgressOptions): NProgress;
    start(): void;
    done(force?: boolean): void;
  }

  const nProgress: NProgress;
  export default nProgress;
}
