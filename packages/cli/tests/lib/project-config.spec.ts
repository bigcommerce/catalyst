import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { mkTempDir } from '../../src/lib/mk-temp-dir';
import { ProjectConfig } from '../../src/lib/project-config';

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: ProjectConfig;

const projectId = 'a23f5785-fd99-4a94-9fb3-945551623923';

beforeAll(async () => {
  [tmpDir, cleanup] = await mkTempDir();

  config = new ProjectConfig(tmpDir);
});

afterAll(async () => {
  await cleanup();
});

test('throws error if field is missing', async () => {
  const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

  await mkdir(dirname(projectJsonPath), { recursive: true });
  await writeFile(projectJsonPath, JSON.stringify({}));

  expect(() => config.get('projectId')).toThrowError(
    "No 'projectId' found in .bigcommerce/project.json.",
  );
});

test('throws error if field does not match schema', async () => {
  const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

  await mkdir(dirname(projectJsonPath), { recursive: true });
  await writeFile(projectJsonPath, JSON.stringify({ projectId: 'invalid-uuid' }));

  expect(() => config.get('projectId')).toThrowError(
    'Config schema violation: `projectId` must match format "uuid"',
  );
});

test('writes and reads field from .bigcommerce/project.json', async () => {
  const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

  await mkdir(dirname(projectJsonPath), { recursive: true });
  await writeFile(projectJsonPath, JSON.stringify({}));

  config.set('projectId', projectId);

  const modifiedProjectId = config.get('projectId');

  expect(modifiedProjectId).toBe(projectId);
});
