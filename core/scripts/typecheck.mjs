#!/usr/bin/env node
// Type-checks with tsrs (a Rust port of the TypeScript 7.1 compiler). tsrs only publishes binaries for
// macOS arm64 and Linux, so on other platforms (Windows, Intel macOS) this falls back to the official
// TypeScript 7.1 native compiler, which checks with the same rules.
//
// Usage: node scripts/typecheck.mjs [tsc flags...]   (defaults to --noEmit)
/* eslint-disable no-console */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Keep in step with the TypeScript version tsrs tracks (see `tsrs --version`).
const FALLBACK_TYPESCRIPT = 'typescript@7.1.0-beta';

const args = process.argv.length > 2 ? process.argv.slice(2) : ['--noEmit'];
const require = createRequire(join(process.cwd(), 'package.json'));

async function findTsrs() {
  try {
    const root = dirname(require.resolve('tsrs/package.json'));
    // getExePath throws when no binary is published for this platform.
    const { default: getExePath } = await import(
      pathToFileURL(join(root, 'lib/getExePath.js')).href
    );

    return getExePath();
  } catch {
    return null;
  }
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', ...options });

  if (result.error) {
    console.error(`typecheck: failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

const tsrs = await findTsrs();

if (tsrs) {
  run(tsrs, args);
} else {
  console.error(
    `typecheck: tsrs has no binary for ${process.platform}-${process.arch}; using ${FALLBACK_TYPESCRIPT}.`,
  );
  run('npx', ['--yes', '--package', FALLBACK_TYPESCRIPT, 'tsc', ...args], {
    shell: process.platform === 'win32',
  });
}
