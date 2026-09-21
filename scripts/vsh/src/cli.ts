import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scanCircularDependencies } from './check-circular.ts';
import { checkWorkspacePackages } from './check-workspace.ts';
import { runClean } from './commands/clean.ts';
import { runDevlog } from './commands/devlog.ts';
import { runGenerateConfigs } from './commands/generate-configs.ts';
import { runGenerateContracts } from './commands/generate-contracts.ts';
import { runLowCodeSoak } from './commands/low-code-soak.ts';
import { runMigrateDocsDemo } from './commands/migrate-docs-demo.ts';
import { runSplitConsoleApi } from './commands/split-console-api.ts';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const workspaceRoot = join(packageRoot, '..', '..');

const CHECK_MODULES = {
  'check-b-inventory': './checks/check-b-inventory.ts',
  'check-boundaries': './checks/check-boundaries.ts',
  'check-bundle': './checks/check-bundle-budget.ts',
  'check-css-sources': './checks/check-css-sources.ts',
  'check-docs-mf': './checks/check-docs-mf.ts',
  'check-editor-boundaries': './checks/check-editor-boundaries.ts',
  'check-generated': './checks/check-generated.ts',
  'check-host-workspace': './checks/check-host-workspace.ts',
  'check-iframe-driver': './checks/check-iframe-driver.ts',
  'check-integration-mf': './checks/check-integration-mf.ts',
  'check-inventory': './checks/check-inventory.ts',
  'check-login-host': './checks/check-login-host.ts',
  'check-mf-poc': './checks/check-mf-poc.ts',
  'check-remote-resilience': './checks/check-remote-resilience.ts',
  'check-settings-mf': './checks/check-settings-mf.ts',
} as const;

const COMMAND_HELP = [
  'scan-circular',
  'check-workspace',
  ...Object.keys(CHECK_MODULES),
  'generate-configs',
  'generate-contracts',
  'clean',
  'devlog',
  'soak-low-code',
  'migrate-docs-demo',
  'split-console-api',
].join('|');

export async function runCli(argv: string[]): Promise<void> {
  const [command, ...args] = argv;

  if (!command) {
    console.error(`Usage: nebula-vsh <${COMMAND_HELP}>`);
    process.exitCode = 2;
    return;
  }

  if (command in CHECK_MODULES) {
    const previousCwd = process.cwd();
    process.chdir(workspaceRoot);
    try {
      await import(CHECK_MODULES[command as keyof typeof CHECK_MODULES]);
    } finally {
      process.chdir(previousCwd);
    }
    return;
  }

  switch (command) {
    case 'check-workspace':
      await checkWorkspacePackages(workspaceRoot);
      return;
    case 'clean':
      await runClean(workspaceRoot, args);
      return;
    case 'devlog':
      await runDevlog(workspaceRoot, args);
      return;
    case 'generate-configs':
      await runGenerateConfigs(workspaceRoot, args);
      return;
    case 'generate-contracts':
      await runGenerateContracts(workspaceRoot, args);
      return;
    case 'migrate-docs-demo':
      await runMigrateDocsDemo(workspaceRoot, args);
      return;
    case 'scan-circular':
      await scanCircularDependencies(workspaceRoot);
      return;
    case 'soak-low-code':
      await runLowCodeSoak(workspaceRoot, args);
      return;
    case 'split-console-api':
      await runSplitConsoleApi(workspaceRoot, args);
      return;
    default:
      console.error(`Usage: nebula-vsh <${COMMAND_HELP}>`);
      process.exitCode = 2;
  }
}
