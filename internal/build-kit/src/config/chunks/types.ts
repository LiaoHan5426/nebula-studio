/**
 * Rolldown / Rollup 会传入第二参；内置规则不依赖具体类型，保持可扩展。
 */
export type NebulaManualChunkMeta = Readonly<Record<string, unknown>>;

export type NebulaManualChunkRule = (
  id: string,
  meta: NebulaManualChunkMeta,
) => string | undefined;

export interface NebulaRendererChunksOptions {
  /**
   * 为 renderer 构建注入 `build.rollupOptions.output.manualChunks`。
   * @default true
   */
  enabled?: boolean;
  /**
   * 在默认规则**之前**执行，可覆盖某条依赖的拆分结果或补充新包名规则。
   */
  extraRules?: NebulaManualChunkRule[];
}
