export function nebulaChunkNormalizeId(id: string): string {
  return id.replace(/\\/g, '/');
}

/** `…/node_modules/<pkg>/…` 或 `…/node_modules/<pkg>`（无尾部 slash） */
export function nebulaChunkIsFromNodeModulePackage(
  normalizedId: string,
  pkg: string,
): boolean {
  const needle = `/node_modules/${pkg}/`;
  const needleEnd = `/node_modules/${pkg}`;
  return (
    normalizedId.includes(needle) ||
    normalizedId.endsWith(needleEnd) ||
    normalizedId.includes(`${needleEnd}/`)
  );
}
