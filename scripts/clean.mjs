import { promises as fs } from 'node:fs';
import { join, normalize } from 'node:path';

const rootDir = process.cwd();
const isWindows = process.platform === 'win32';

const CONCURRENCY_LIMIT = 10;
const MAX_RECURSION_DEPTH = 10;

const SKIP_DIRS = new Set([
  '.DS_Store',
  '.git',
  '.idea',
  '.vscode',
  '.trae',
  '.vite-hooks',
  'agent-skills',
]);

const RM_OPTIONS = {
  force: true,
  recursive: true,
};

/**
 * 删除路径，不进行重试，失败时提示并跳过。
 */
async function removePathWithRetry(itemPath, { quiet = false } = {}) {
  const normalizedPath = normalize(itemPath);

  try {
    await fs.rm(normalizedPath, RM_OPTIONS);
    if (!quiet) {
      console.log(`✅ Deleted: ${normalizedPath}`);
    }
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return true;
    }

    if (!quiet) {
      console.error(`⚠️ Skip to delete ${normalizedPath}: ${error.message}`);
      if (isWindows && error.code === 'EBUSY') {
        console.error(
          '   Tip: stop running Vite / `vp run dev` processes, close IDE Vite extension tasks, then rerun `vp run clean`.',
        );
      }
    }
    return false;
  }
}

async function processItem(currentDir, item, targets, _depth) {
  if (SKIP_DIRS.has(item)) {
    return false;
  }

  try {
    const itemPath = normalize(join(currentDir, item));

    if (targets.includes(item)) {
      if (item === 'node_modules') {
        const vitePath = join(itemPath, '.vite');
        await removePathWithRetry(vitePath, { quiet: true });
      }
      await removePathWithRetry(itemPath);
      return false;
    }

    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    console.error(
      `❌ Error handling item ${item} in ${currentDir}: ${error.message}`,
    );
    return false;
  }
}

async function cleanTargetsRecursively(currentDir, targets, depth = 0) {
  if (depth > MAX_RECURSION_DEPTH) {
    console.warn(`Max recursion depth reached at: ${currentDir}`);
    return;
  }

  let dirents;
  try {
    dirents = await fs.readdir(currentDir, { withFileTypes: true });
  } catch (error) {
    console.warn(`Cannot read directory ${currentDir}: ${error.message}`);
    return;
  }

  for (let i = 0; i < dirents.length; i += CONCURRENCY_LIMIT) {
    const batch = dirents.slice(i, i + CONCURRENCY_LIMIT);

    const tasks = batch.map(async (dirent) => {
      const item = dirent.name;
      const shouldRecurse = await processItem(currentDir, item, targets, depth);

      if (shouldRecurse && dirent.isDirectory()) {
        const itemPath = normalize(join(currentDir, item));
        return cleanTargetsRecursively(itemPath, targets, depth + 1);
      }

      return null;
    });

    const results = await Promise.allSettled(tasks);
    const failedTasks = results.filter(
      (result) => result.status === 'rejected',
    );
    if (failedTasks.length > 0) {
      console.warn(
        `${failedTasks.length} tasks failed in batch starting at index ${i} in directory: ${currentDir}`,
      );
    }
  }
}

(async function startCleanup() {
  const targets = ['node_modules', 'dist', '.turbo', 'dist.zip'];
  const deleteLockFile = process.argv.includes('--del-lock');
  const cleanupTargets = [...targets];

  if (deleteLockFile) {
    cleanupTargets.push('pnpm-lock.yaml');
  }

  console.log(
    `🚀 Starting cleanup of targets: ${cleanupTargets.join(', ')} from root: ${rootDir}`,
  );

  const startTime = Date.now();
  let hadFailure = false;

  try {
    console.log('📊 Scanning for cleanup targets...');
    await cleanTargetsRecursively(rootDir, cleanupTargets);

    const rootNodeModules = normalize(join(rootDir, 'node_modules'));
    try {
      await fs.access(rootNodeModules);
      console.log('🔁 Retrying root node_modules deletion ...');
      const ok = await removePathWithRetry(rootNodeModules);
      if (!ok) {
        hadFailure = true;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    if (hadFailure) {
      console.warn(
        `⚠️ Cleanup finished with errors in ${duration.toFixed(2)}s (see messages above).`,
      );
      process.exitCode = 1;
      return;
    }

    console.log(
      `✨ Cleanup process completed successfully in ${duration.toFixed(2)}s`,
    );
  } catch (error) {
    console.error(`💥 Unexpected error during cleanup: ${error.message}`);
    process.exit(1);
  }
})();
