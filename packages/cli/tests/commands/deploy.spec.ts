import AdmZip from 'adm-zip';
import { Command } from 'commander';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import {
  createDeployment,
  deploy,
  generateBundleZip,
  generateUploadSignature,
  getDeploymentStatus,
  uploadBundleZip,
} from '../../src/commands/deploy';
import { mkTempDir } from '../../src/lib/mk-temp-dir';
import { textHistory } from '../mocks/spinner';

// eslint-disable-next-line import/dynamic-import-chunkname
vi.mock('yocto-spinner', () => import('../mocks/spinner'));

let tmpDir: string;
let cleanup: () => Promise<void>;
let outputZip: string;

const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';
const storeHash = 'test-store';
const accessToken = 'test-token';
const apiHost = 'api.bigcommerce.com';
const uploadUuid = '0e93ce5f-6f91-4236-87ec-ca79627f31ba';
const uploadUrl = 'https://mock-upload-url.com';
const deploymentUuid = '5b29c3c0-5f68-44fe-99e5-06492babf7be';

beforeAll(async () => {
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

test('properly configured Command instance', () => {
  expect(deploy).toBeInstanceOf(Command);
  expect(deploy.name()).toBe('deploy');
  expect(deploy.description()).toBe('Deploy your application to Cloudflare.');
  expect(deploy.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ flags: '--store-hash <hash>' }),
      expect.objectContaining({ flags: '--access-token <token>' }),
      expect.objectContaining({ flags: '--api-host <host>', defaultValue: 'api.bigcommerce.com' }),
      expect.objectContaining({ flags: '--project-uuid <uuid>' }),
      expect.objectContaining({ flags: '--root-dir <path>', defaultValue: process.cwd() }),
    ]),
  );
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

    expect(deployment.deployment_uuid).toBe(deploymentUuid);
  });

  test('polls deployment status until completion', async () => {
    await getDeploymentStatus(deploymentUuid, storeHash, accessToken, apiHost);

    expect(textHistory).toEqual([
      `Checking deployment status for ${deploymentUuid}...`,
      'PROCESSING',
      'FINALIZING',
    ]);

    // Since the mock returns a stream, we can't assert on the final state directly.
    // Instead, we check that the function completes without throwing.
    expect(true).toBe(true); // Placeholder assertion
  });
});
