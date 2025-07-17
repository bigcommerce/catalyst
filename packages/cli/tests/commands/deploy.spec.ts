import AdmZip from 'adm-zip';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { generateBundleZip } from '../../src/commands/deploy';
import { mkTempDir } from '../../src/lib/mk-temp-dir';

let tmpDir: string;
let cleanup: () => Promise<void>;
let outputZip: string;

beforeAll(async () => {
  // Setup test directories and files
  [tmpDir, cleanup] = await mkTempDir();

  const workerPath = join(tmpDir, '.bigcommerce/dist/worker.js');
  const assetsDir = join(tmpDir, '.bigcommerce/dist/assets');

  outputZip = join(tmpDir, '.bigcommerce/dist/bundle.zip');

  await mkdir(dirname(workerPath), { recursive: true });
  await writeFile(workerPath, 'console.log("worker");');
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(assetsDir, 'test.txt'), 'asset file');
});

afterAll(async () => {
  await cleanup();
});

describe('bundle zip generation', () => {
  test('creates bundle.zip from build output', async () => {
    await generateBundleZip(tmpDir);

    // Check file exists
    const stats = await stat(outputZip);

    expect(stats.size).toBeGreaterThan(0);
  });

  test('zip contains output folder with assets and worker.js', async () => {
    await generateBundleZip(tmpDir);

    // Check file exists
    const stats = await stat(outputZip);

    expect(stats.size).toBeGreaterThan(0);

    const zip = new AdmZip(outputZip);
    const entries = zip.getEntries().map((e) => e.entryName);

    // Check for output/ folder
    expect(entries.every((e) => e.startsWith('output/'))).toBe(true);
    // Check for output/assets/ directory
    expect(entries.some((e) => e.startsWith('output/assets/'))).toBe(true);
    // Check for output/worker.js
    expect(entries).toContain('output/worker.js');
  });
});
