import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const packageRoots = ['apps', 'internal', 'packages', 'tools'];
const manifests = new Map();
const failures = [];

function visit(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['dev-dist', 'dist', 'node_modules'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    if (entry.isFile() && entry.name === 'package.json') {
      const manifest = JSON.parse(readFileSync(path, 'utf8'));
      if (typeof manifest.name === 'string') {
        manifests.set(manifest.name, { manifest, path });
      }
    }
  }
}

for (const directory of packageRoots) visit(join(root, directory));

const editorRuntimePattern =
  /^(?:@codemirror\/|codemirror$|monaco-editor(?:-vue3)?$|@tiptap\/)/;
const ui = manifests.get('@nebula-studio/nebula-ui');
if (!ui) failures.push('nebula-ui manifest is missing');
for (const group of [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
]) {
  for (const dependency of Object.keys(ui?.manifest[group] ?? {})) {
    if (editorRuntimePattern.test(dependency)) {
      failures.push(`nebula-ui ${group} leaks editor runtime: ${dependency}`);
    }
    if (/^@nebula-studio\/nebula-.*editor$/.test(dependency)) {
      failures.push(`nebula-ui depends on editor package: ${dependency}`);
    }
  }
}

scanSources(join(root, 'packages', 'ui'));

const graph = new Map();
for (const [name, { manifest }] of manifests) {
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.peerDependencies,
    ...manifest.optionalDependencies,
  };
  graph.set(
    name,
    Object.keys(dependencies).filter((dependency) => manifests.has(dependency)),
  );
}

const visiting = new Set();
const visited = new Set();
function detectCycle(name, path = []) {
  if (visiting.has(name)) {
    failures.push(
      `workspace dependency cycle: ${[...path, name].join(' -> ')}`,
    );
    return;
  }
  if (visited.has(name)) return;
  visiting.add(name);
  for (const dependency of graph.get(name) ?? []) {
    detectCycle(dependency, [...path, name]);
  }
  visiting.delete(name);
  visited.add(name);
}
for (const name of graph.keys()) detectCycle(name);

if (!manifests.has('@nebula-studio/nebula-code-editor')) {
  failures.push('code-editor workspace package is missing');
}

console.log(
  `[editor-boundaries] checked ${manifests.size} workspace packages; ${graph.size} dependency nodes`,
);
if (failures.length) {
  throw new Error(
    `[editor-boundaries] failed:\n- ${[...new Set(failures)].join('\n- ')}`,
  );
}
console.log(
  '[editor-boundaries] UI/editor boundaries and dependency graph passed',
);
