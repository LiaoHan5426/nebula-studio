/**
 * Generate window configuration from configs/windows.json.
 *
 * - Validates windows.json against the JSON Schema (basic structural validation).
 * - Outputs TypeScript constants to packages/core/app-shell/src/common/_generated-windows.ts.
 *
 * Usage: node scripts/generate-window-configs.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, '..');

const VALID_CAPABILITIES = new Set(['auth', 'notify', 'settings', 'shell']);

/**
 * Basic structural validation of windows.json (mirrors JSON Schema constraints).
 */
function validateConfig(config) {
  const errors = [];

  if (!config.windows || typeof config.windows !== 'object') {
    errors.push('Missing required field: "windows"');
    return errors;
  }

  // Validate each window config
  for (const [windowId, win] of Object.entries(config.windows)) {
    if (!win.preload) errors.push(`windows.${windowId}: missing "preload"`);
    if (!win.renderer) errors.push(`windows.${windowId}: missing "renderer"`);
    if (!win.label) errors.push(`windows.${windowId}: missing "label"`);

    if (win.preloadCapabilities) {
      if (!Array.isArray(win.preloadCapabilities)) {
        errors.push(
          `windows.${windowId}: "preloadCapabilities" must be an array`,
        );
      } else {
        for (const cap of win.preloadCapabilities) {
          if (!VALID_CAPABILITIES.has(cap)) {
            errors.push(
              `windows.${windowId}: invalid capability "${cap}" (valid: ${[...VALID_CAPABILITIES].join(', ')})`,
            );
          }
        }
        if (
          new Set(win.preloadCapabilities).size !==
          win.preloadCapabilities.length
        ) {
          errors.push(
            `windows.${windowId}: "preloadCapabilities" has duplicate entries`,
          );
        }
      }
    }

    if (win.electronEmbeddedPresentation !== undefined) {
      // Not valid on window level
    }
  }

  // Validate modalRenderers
  if (config.modalRenderers) {
    for (const [modalId, modal] of Object.entries(config.modalRenderers)) {
      if (!modal.preload)
        errors.push(`modalRenderers.${modalId}: missing "preload"`);
      if (!modal.renderer)
        errors.push(`modalRenderers.${modalId}: missing "renderer"`);

      if (modal.preloadCapabilities) {
        for (const cap of modal.preloadCapabilities) {
          if (!VALID_CAPABILITIES.has(cap)) {
            errors.push(
              `modalRenderers.${modalId}: invalid capability "${cap}"`,
            );
          }
        }
      }
    }
  }

  // Validate displayOrder
  if (config.displayOrder) {
    if (!Array.isArray(config.displayOrder)) {
      errors.push('"displayOrder" must be an array');
    } else {
      const windowIds = new Set(Object.keys(config.windows));
      for (const id of config.displayOrder) {
        if (!windowIds.has(id)) {
          errors.push(`displayOrder: "${id}" is not a defined window ID`);
        }
      }
    }
  }

  // Validate rendererSources
  if (config.rendererSources) {
    for (const [name, dir] of Object.entries(config.rendererSources)) {
      if (typeof dir !== 'string' || !dir) {
        errors.push(`rendererSources.${name}: must be a non-empty string`);
      }
    }
  }

  return errors;
}

/**
 * Generate TypeScript code from the validated config.
 */
function generateTypeScript(config) {
  const lines = [];

  lines.push('// AUTO-GENERATED — do not edit manually.');
  lines.push('// Source: configs/windows.json');
  lines.push(`// Generated at: ${new Date().toISOString()}`);
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

  // Shell config
  if (config.shell) {
    lines.push('export const GENERATED_SHELL_CONFIG = {');
    for (const [key, value] of Object.entries(config.shell)) {
      lines.push(`  ${key}: ${JSON.stringify(value)},`);
    }
    lines.push('} as const;');
    lines.push('');
  }

  // Electron embedded presentation
  if (config.electronEmbeddedPresentation) {
    lines.push(
      `export const GENERATED_ELECTRON_EMBEDDED_PRESENTATION = ${JSON.stringify(config.electronEmbeddedPresentation)} as const;`,
    );
    lines.push('');
  }

  // Windows
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

  // Modal renderers
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

  // Display order
  if (config.displayOrder) {
    lines.push(
      `export const GENERATED_DISPLAY_ORDER: readonly string[] = ${JSON.stringify(config.displayOrder)} as const;`,
    );
    lines.push('');
  }

  // API bases
  if (config.apiBases) {
    lines.push(
      `export const GENERATED_API_BASES: Record<string, string> = ${JSON.stringify(config.apiBases, null, 2)} as const;`,
    );
    lines.push('');
  }

  // API targets (dev proxy)
  if (config.apiTargets) {
    lines.push(
      `export const GENERATED_API_TARGETS: Record<string, string> = ${JSON.stringify(config.apiTargets, null, 2)} as const;`,
    );
    lines.push('');
  }

  // Renderer sources (dev alias)
  if (config.rendererSources) {
    lines.push(
      `export const GENERATED_RENDERER_SOURCES: Record<string, string> = ${JSON.stringify(config.rendererSources, null, 2)} as const;`,
    );
    lines.push('');
  }

  // Window IDs union type
  const windowIds = Object.keys(config.windows);
  lines.push(
    `export type GeneratedWindowId = ${windowIds.map((id) => JSON.stringify(id)).join(' | ')};`,
  );
  lines.push('');

  return lines.join('\n');
}

// --- Main ---

const configPath = join(rootDir, 'configs', 'windows.json');
const outputPath = join(
  rootDir,
  'packages',
  'core',
  'app-shell',
  'src',
  'common',
  '_generated-windows.ts',
);

console.log('📖 Reading configs/windows.json ...');
const raw = readFileSync(configPath, 'utf-8');
const config = JSON.parse(raw);

console.log('🔍 Validating configuration ...');
const errors = validateConfig(config);
if (errors.length > 0) {
  console.error('❌ Validation failed:');
  for (const err of errors) {
    console.error(`   - ${err}`);
  }
  process.exit(1);
}
console.log('✅ Validation passed.');

console.log('🔧 Generating TypeScript ...');
const ts = generateTypeScript(config);

const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}
writeFileSync(outputPath, ts, 'utf-8');

console.log(`✅ Generated: ${outputPath}`);
console.log(`   ${ts.split('\n').length} lines written.`);
