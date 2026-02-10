#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'node:path';

import { program } from './program';

// Load --env-file before parse so option resolution uses this order:
// 1. Explicit flags  2. --env-file (if passed)  3. process.env (shell)  4. project.json
const envFileIndex = process.argv.findIndex(
  (arg) => arg === '--env-file' || arg.startsWith('--env-file='),
);

if (envFileIndex !== -1) {
  const arg = process.argv[envFileIndex];
  const path =
    arg === '--env-file' ? process.argv[envFileIndex + 1] : arg.slice('--env-file='.length);

  if (path) {
    config({ path: resolve(process.cwd(), path), override: true });
  }
}

program.parse(process.argv);
