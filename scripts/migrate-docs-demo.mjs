#!/usr/bin/env node
/**
 * Migrate docs demo pages from dual .vue + .vue?raw imports to .vue?demo.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const pagesDir = join(scriptDir, '../apps/sub-web/docs/src/pages');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith('.vue')) {
      out.push(full);
    }
  }
  return out;
}

function toDemoVar(name) {
  return `${name.charAt(0).toLowerCase() + name.slice(1)}Demo`;
}

function migrate(content) {
  let next = content.replace(
    /\/\/ eslint-disable-next-line import\/no-duplicates\r?\n/g,
    '',
  );

  const rawImportRe =
    /import\s+(\w+)Source\s+from\s+['"]([^'"]+\.vue\?raw)['"];\r?\n/g;
  const demos = [...next.matchAll(rawImportRe)].map((match) => ({
    componentName: match[1],
    path: match[2].replace(/\?raw$/, ''),
    demoVar: toDemoVar(match[1]),
  }));

  if (demos.length === 0) {
    return content;
  }

  next = next.replace(rawImportRe, '');

  for (const demo of demos) {
    const componentImportRe = new RegExp(
      `import\\s+${demo.componentName}\\s+from\\s+['"]${demo.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];\\r?\\n`,
    );
    next = next.replace(
      componentImportRe,
      `import ${demo.demoVar} from '${demo.path}?demo';\n`,
    );
    next = next.replaceAll(
      `:component="${demo.componentName}"`,
      `:component="${demo.demoVar}.component"`,
    );
    next = next.replaceAll(
      `:source="${demo.componentName}Source"`,
      `:source="${demo.demoVar}.source"`,
    );
  }

  return next;
}

for (const filePath of walk(pagesDir)) {
  const original = readFileSync(filePath, 'utf8');
  const migrated = migrate(original);
  if (migrated !== original) {
    writeFileSync(filePath, migrated, 'utf8');
    console.log(`Migrated ${filePath.replace(`${pagesDir}/`, '')}`);
  }
}

console.log('Done.');
