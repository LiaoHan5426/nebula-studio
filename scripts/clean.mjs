import { promises as fs } from 'node:fs';
import { join, normalize } from 'node:path';

const rootDir = process.cwd();
const isWindows = process.platform === 'win32';

const CONCURRENCY_LIMIT = 10;
const MAX_RECURSION_DEPTH = 10;
const MAX_TRAVERSE_DEPTH = 20;

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
  maxRetries: isWindows ? 8 : 3,
  retryDelay: isWindows ? 250 : 100,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 删除 Vite task-cache 中的 SQLite 附属文件（Windows 上常见 EBUSY 来源）。
 */
async function clearViteTaskCache(viteDir) {
  const taskCacheDir = join(viteDir, 'task-cache');
  let entries;
  try {
    entries = await fs.readdir(taskCacheDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const filePath = join(taskCacheDir, entry.name);
    if (entry.isDirectory()) {
      await removePathWithRetry(filePath, { quiet: true, maxAttempts: 5 });
      continue;
    }
    await fs
      .rm(filePath, {
        force: true,
        maxRetries: RM_OPTIONS.maxRetries,
        retryDelay: RM_OPTIONS.retryDelay,
      })
      .catch(() => {});
  }
}

function isViteCacheDir(itemPath) {
  return itemPath.split(/[/\\]/).includes('.vite');
}

/**
 * 带重试删除；Windows 上先尝试清理 .vite/task-cache 再删目录。
 */
async function removePathWithRetry(
  itemPath,
  { maxAttempts = 6, quiet = false } = {},
) {
  const normalizedPath = normalize(itemPath);
  let delayMs = 150;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (isViteCacheDir(normalizedPath)) {
        await clearViteTaskCache(normalizedPath).catch(() => {});
      }

      await fs.rm(normalizedPath, RM_OPTIONS);
      if (!quiet) {
        console.log(`✅ Deleted: ${normalizedPath}`);
      }
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return true;
      }

      const retriable =
        error.code === 'EBUSY' ||
        error.code === 'EPERM' ||
        error.code === 'EACCES' ||
        error.code === 'ENOTEMPTY';

      if (!retriable || attempt === maxAttempts) {
        if (!quiet) {
          console.error(
            `❌ Failed to delete ${normalizedPath} after ${attempt} attempt(s): ${error.message}`,
          );
          if (isWindows && error.code === 'EBUSY') {
            console.error(
              '   Tip: stop running Vite / `vp run dev` processes, close IDE Vite extension tasks, then rerun `vp run clean`.',
            );
          }
        }
        return false;
      }

      if (isViteCacheDir(normalizedPath)) {
        await clearViteTaskCache(normalizedPath).catch(() => {});
      }

      await sleep(delayMs);
      delayMs = Math.min(Math.round(delayMs * 1.6), 2000);
    }
  }

  return false;
}

/**
 * 预清理：只删除各 workspace 下的 node_modules/.vite，不递归进入 node_modules 内部。
 */
async function precleanViteCaches(currentDir, depth = 0) {
  if (depth > MAX_TRAVERSE_DEPTH) {
    return;
  }

  let dirents;
  try {
    dirents = await fs.readdir(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  const subdirs = [];

  for (const dirent of dirents) {
    const name = dirent.name;
    if (!dirent.isDirectory() || name === '.git') {
      continue;
    }

    const itemPath = normalize(join(currentDir, name));

    if (name === 'node_modules') {
      const vitePath = join(itemPath, '.vite');
      try {
        await fs.access(vitePath);
        console.log(`  clearing ${vitePath}`);
        await removePathWithRetry(vitePath, { maxAttempts: 4, quiet: true });
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`  skip ${vitePath}: ${error.message}`);
        }
      }
      continue;
    }

    if (SKIP_DIRS.has(name) || name === 'dist' || name === '.turbo') {
      continue;
    }

    subdirs.push(itemPath);
  }

  for (let i = 0; i < subdirs.length; i += CONCURRENCY_LIMIT) {
    const batch = subdirs.slice(i, i + CONCURRENCY_LIMIT);
    await Promise.allSettled(
      batch.map((dir) => precleanViteCaches(dir, depth + 1)),
    );
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
        await removePathWithRetry(vitePath, { maxAttempts: 4, quiet: true });
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
    console.log('🧹 Pre-cleaning Vite caches (node_modules/.vite) ...');
    await precleanViteCaches(rootDir);
    console.log('✅ Vite cache pre-clean done');

    console.log('📊 Scanning for cleanup targets...');
    await cleanTargetsRecursively(rootDir, cleanupTargets);

    const rootNodeModules = normalize(join(rootDir, 'node_modules'));
    try {
      await fs.access(rootNodeModules);
      console.log('🔁 Retrying root node_modules deletion ...');
      const ok = await removePathWithRetry(rootNodeModules, { maxAttempts: 8 });
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
