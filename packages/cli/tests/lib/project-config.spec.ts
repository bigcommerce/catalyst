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

describe('getProjectId', () => {
  test('throws error if projectId is missing', async () => {
    const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

    await mkdir(dirname(projectJsonPath), { recursive: true });
    await writeFile(projectJsonPath, JSON.stringify({}));

    expect(() => config.getProjectId()).toThrowError(
      'No `projectId` found in .bigcommerce/project.json. Please add a valid `projectId` (UUID) to your bigcommerce configuration file.',
    );
  });

  test('throws error if projectId is not uuid', async () => {
    const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

    await mkdir(dirname(projectJsonPath), { recursive: true });
    await writeFile(projectJsonPath, JSON.stringify({ projectId: 'invalid-uuid' }));

    expect(() => config.getProjectId()).toThrowError(
      'Config schema violation: `projectId` must match format "uuid"',
    );
  });

  test('writes and reads projectId from .bigcommerce/project.json', async () => {
    const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

    await mkdir(dirname(projectJsonPath), { recursive: true });
    await writeFile(projectJsonPath, JSON.stringify({}));

    config.setProjectId(projectId);

    const modifiedProjectId = config.getProjectId();

    expect(modifiedProjectId).toBe(projectId);
  });
});
