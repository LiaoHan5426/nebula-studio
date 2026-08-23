import { circularDepsDetect } from 'circular-dependency-scanner';

export async function scanCircularDependencies(workspaceRoot) {
  const circles = await circularDepsDetect({
    cwd: workspaceRoot,
    filter: '{apps,packages}/**/*',
    ignore: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/.mf/**'],
    excludeTypes: true,
  });
  if (circles.length > 0) {
    console.error('[nebula-vsh] circular dependencies detected:');
    for (const circle of circles) console.error(`  ${circle.join(' -> ')}`);
    process.exitCode = 1;
    return;
  }
  console.log('[nebula-vsh] circular dependency scan passed');
}
