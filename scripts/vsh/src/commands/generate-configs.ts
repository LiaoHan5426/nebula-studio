import { execFileSync } from 'node:child_process';

import { writeWindowConfigArtifacts } from '@nebula-studio-internal/node-kit/window-config';

/** Generate window / API namespace artifacts from configs + env. */
export async function runGenerateConfigs(
  rootDir: string,
  _args: string[] = [],
): Promise<void> {
  console.log('Reading split configs (windows/environment/real-stack/e2e) ...');
  console.log('Validating configuration ...');

  try {
    const paths = writeWindowConfigArtifacts(rootDir);
    console.log('Validation passed.');
    console.log('Generating TypeScript ...');
    execFileSync(
      'vp',
      ['fmt', paths.windowsOutputPath, paths.apiNamespacesPath, '--write'],
      {
        cwd: rootDir,
        stdio: 'inherit',
      },
    );
    console.log(`Generated: ${paths.windowsOutputPath}`);
    console.log(`Generated: ${paths.apiNamespacesPath}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
