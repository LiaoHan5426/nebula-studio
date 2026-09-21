import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function walk (dir: string): string[] {
  const out: string[] = [];
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

function toDemoVar (name: string): string {
  return `${name.charAt(0).toLowerCase() + name.slice(1)}Demo`;
}

function migrate (content: string): string {
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

/** One-shot: migrate docs demo pages from dual .vue + ?raw to .vue?demo. */
export async function runMigrateDocsDemo (
  root: string,
  _args: string[] = [],
): Promise<void> {
  const pagesDir = join(root, 'apps/sub-web/docs/src/pages');
  for (const filePath of walk(pagesDir)) {
    const original = readFileSync(filePath, 'utf8');
    const migrated = migrate(original);
    if (migrated !== original) {
      writeFileSync(filePath, migrated, 'utf8');
      console.log(`Migrated ${filePath.replace(`${pagesDir}/`, '')}`);
    }
  }
  console.log('Done.');
}
