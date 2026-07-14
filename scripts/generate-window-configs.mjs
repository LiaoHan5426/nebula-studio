/**
 * Generate window configuration from configs/windows.json.
 *
 * - Validates windows.json against configs/windows.schema.json (Ajv).
 * - Validates renderer main.ts and boot.ts entry files exist.
 * - Outputs TypeScript constants to packages/core/app-shell/src/common/_generated-windows.ts.
 *
 * Usage: node scripts/generate-window-configs.mjs
 */

import Ajv from 'ajv';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, '..');
const configPath = join(rootDir, 'configs', 'windows.json');
const schemaPath = join(rootDir, 'configs', 'windows.schema.json');
const outputPath = join(
  rootDir,
  'packages',
  'core',
  'app-shell',
  'src',
  'common',
  '_generated-windows.ts',
);
const subWebDir = join(rootDir, 'apps', 'sub-web');

/**
 * Validate config with JSON Schema and check renderer entry files on disk.
 */
function validateConfig(config, schema) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  const valid = validate(config);
  const errors = [];

  if (!valid && validate.errors) {
    for (const err of validate.errors) {
      const path = err.instancePath || '(root)';
      errors.push(`${path}: ${err.message ?? 'validation error'}`);
    }
  }

  const rendererIds = new Set();
  if (config.windows) {
    for (const [windowId, win] of Object.entries(config.windows)) {
      rendererIds.add(win.renderer);
      assertRendererExists(
        win.renderer,
        `windows.${windowId}.renderer`,
        errors,
      );
    }
  }
  if (config.modalRenderers) {
    for (const [modalId, modal] of Object.entries(config.modalRenderers)) {
      rendererIds.add(modal.renderer);
      assertRendererExists(
        modal.renderer,
        `modalRenderers.${modalId}.renderer`,
        errors,
      );
    }
  }

  for (const renderer of rendererIds) {
    const mainTs = join(subWebDir, renderer, 'src', 'main.ts');
    const bootTs = join(subWebDir, renderer, 'src', 'boot.ts');
    if (!existsSync(mainTs)) {
      errors.push(
        `renderer "${renderer}": missing required entry apps/sub-web/${renderer}/src/main.ts`,
      );
    }
    if (!existsSync(bootTs)) {
      errors.push(
        `renderer "${renderer}": missing required entry apps/sub-web/${renderer}/src/boot.ts`,
      );
    }
  }

  return errors;
}

function assertRendererExists(renderer, field, errors) {
  const rendererDir = join(subWebDir, renderer);
  if (!existsSync(rendererDir)) {
    errors.push(
      `${field}: unknown renderer "${renderer}" (directory not found)`,
    );
  }
}

/**
 * Generate TypeScript code from the validated config.
 */
function generateTypeScript(config) {
  const lines = [];

  lines.push('// AUTO-GENERATED — do not edit manually.');
  lines.push('// Source: configs/windows.json');
  lines.push('');
  lines.push('export interface GeneratedWindowEntry {');
  lines.push('  preload: string;');
  lines.push('  renderer: string;');
  lines.push('  label: string;');
  lines.push('  iconSvg?: string;');
  lines.push('  defaultEnabled?: boolean;');
  lines.push('  integratable?: boolean;');
  lines.push('  requiresAuth?: boolean;');
  lines.push('  preloadCapabilities?: string[];');
  lines.push('}');
  lines.push('');
  lines.push('export interface GeneratedModalRendererEntry {');
  lines.push('  preload: string;');
  lines.push('  renderer: string;');
  lines.push('  preloadCapabilities?: string[];');
  lines.push('}');
  lines.push('');

  if (config.shell) {
    lines.push('export const GENERATED_SHELL_CONFIG = {');
    for (const [key, value] of Object.entries(config.shell)) {
      lines.push(`  ${key}: ${JSON.stringify(value)},`);
    }
    lines.push('} as const;');
    lines.push('');
  }

  if (config.electronEmbeddedPresentation) {
    lines.push(
      `export const GENERATED_ELECTRON_EMBEDDED_PRESENTATION = ${JSON.stringify(config.electronEmbeddedPresentation)} as const;`,
    );
    lines.push('');
  }

  lines.push(
    'export const GENERATED_WINDOWS: Record<string, GeneratedWindowEntry> = {',
  );
  for (const [windowId, win] of Object.entries(config.windows)) {
    lines.push(`  ${JSON.stringify(windowId)}: {`);
    lines.push(`    preload: ${JSON.stringify(win.preload)},`);
    lines.push(`    renderer: ${JSON.stringify(win.renderer)},`);
    lines.push(`    label: ${JSON.stringify(win.label)},`);
    if (win.iconSvg) lines.push(`    iconSvg: ${JSON.stringify(win.iconSvg)},`);
    if (win.defaultEnabled !== undefined)
      lines.push(`    defaultEnabled: ${win.defaultEnabled},`);
    if (win.integratable !== undefined)
      lines.push(`    integratable: ${win.integratable},`);
    if (win.requiresAuth !== undefined)
      lines.push(`    requiresAuth: ${win.requiresAuth},`);
    if (win.preloadCapabilities)
      lines.push(
        `    preloadCapabilities: ${JSON.stringify(win.preloadCapabilities)},`,
      );
    lines.push('  },');
  }
  lines.push('} as const;');
  lines.push('');

  if (config.modalRenderers && Object.keys(config.modalRenderers).length > 0) {
    lines.push(
      'export const GENERATED_MODAL_RENDERERS: Record<string, GeneratedModalRendererEntry> = {',
    );
    for (const [modalId, modal] of Object.entries(config.modalRenderers)) {
      lines.push(`  ${JSON.stringify(modalId)}: {`);
      lines.push(`    preload: ${JSON.stringify(modal.preload)},`);
      lines.push(`    renderer: ${JSON.stringify(modal.renderer)},`);
      if (modal.preloadCapabilities) {
        lines.push(
          `    preloadCapabilities: ${JSON.stringify(modal.preloadCapabilities)},`,
        );
      }
      lines.push('  },');
    }
    lines.push('} as const;');
    lines.push('');
  }

  if (config.displayOrder) {
    lines.push(
      `export const GENERATED_DISPLAY_ORDER: readonly string[] = ${JSON.stringify(config.displayOrder)} as const;`,
    );
    lines.push('');
  }

  if (config.apiBases) {
    lines.push(
      `export const GENERATED_API_BASES: Record<string, string> = ${JSON.stringify(config.apiBases, null, 2)} as const;`,
    );
    lines.push('');
  }

  if (config.apiTargets) {
    lines.push(
      `export const GENERATED_API_TARGETS: Record<string, string> = ${JSON.stringify(config.apiTargets, null, 2)} as const;`,
    );
    lines.push('');
  }

  if (config.rendererSources) {
    lines.push(
      `export const GENERATED_RENDERER_SOURCES: Record<string, string> = ${JSON.stringify(config.rendererSources, null, 2)} as const;`,
    );
    lines.push('');
  }

  const windowIds = Object.keys(config.windows);
  lines.push(
    `export type GeneratedWindowId = ${windowIds.map((id) => JSON.stringify(id)).join(' | ')};`,
  );
  lines.push('');

  return lines.join('\n');
}

console.log('Reading configs/windows.json ...');
const raw = readFileSync(configPath, 'utf-8');
const config = JSON.parse(raw);
const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));

console.log('Validating configuration ...');
const errors = validateConfig(config, schema);
if (errors.length > 0) {
  console.error('Validation failed:');
  for (const err of errors) {
    console.error(`   - ${err}`);
  }
  process.exit(1);
}
console.log('Validation passed.');

console.log('Generating TypeScript ...');
const ts = generateTypeScript(config);

const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}
writeFileSync(outputPath, ts, 'utf-8');

console.log(`Generated: ${outputPath}`);
console.log(`   ${ts.split('\n').length} lines written.`);
