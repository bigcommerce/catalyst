import AdmZip from 'adm-zip';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import {
  createDeployment,
  generateBundleZip,
  generateUploadSignature,
  uploadBundleZip,
} from '../../src/commands/deploy';
import { mkTempDir } from '../../src/lib/mk-temp-dir';

let tmpDir: string;
let cleanup: () => Promise<void>;
let outputZip: string;

const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const uploadUuid = '0e93ce5f-6f91-4236-87ec-ca79627f31ba';
const uploadUrl = 'https://mock-upload-url.com';

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

describe('bundle zip generation and upload', () => {
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

  test('fetches upload signature and uploads bundle zip', async () => {
    // Test generateUploadSignature
    const signature = await generateUploadSignature(storeHash, accessToken, apiHost);

    expect(signature.upload_url).toBe(uploadUrl);
    expect(signature.upload_uuid).toBe(uploadUuid);

    // Test uploadBundleZip
    await generateBundleZip(tmpDir); // Ensure zip exists

    const uploadResult = await uploadBundleZip(uploadUrl, tmpDir);

    expect(uploadResult).toBe(true);
  });
});

describe('deployment and polling', () => {
  test('creates a deployment', async () => {
    const deployment = await createDeployment(
      projectUuid,
      uploadUuid,
      storeHash,
      accessToken,
      apiHost,
    );

    expect(deployment.deployment_uuid).toBe('5b29c3c0-5f68-44fe-99e5-06492babf7be');
  });
});
