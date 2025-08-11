import Conf from 'conf';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { mkTempDir } from '../../src/lib/mk-temp-dir';
import { getProjectConfig, ProjectConfigSchema } from '../../src/lib/project-config';

let tmpDir: string;
let cleanup: () => Promise<void>;
let config: Conf<ProjectConfigSchema>;

const projectUuid = 'a23f5785-fd99-4a94-9fb3-945551623923';

beforeAll(async () => {
  [tmpDir, cleanup] = await mkTempDir();

  config = getProjectConfig(tmpDir);
});

afterAll(async () => {
  await cleanup();
});

test('throws error if field does not match schema', async () => {
  const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

  await mkdir(dirname(projectJsonPath), { recursive: true });
  await writeFile(projectJsonPath, JSON.stringify({ projectUuid: 'invalid-uuid' }));

  expect(() => config.get('projectUuid')).toThrowError(
    'Config schema violation: `projectUuid` must match format "uuid"',
  );
});

test('writes and reads field from .bigcommerce/project.json', async () => {
  const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

  await mkdir(dirname(projectJsonPath), { recursive: true });
  await writeFile(projectJsonPath, JSON.stringify({}));

  config.set('projectUuid', projectUuid);

  const modifiedProjectUuid = config.get('projectUuid');

  expect(modifiedProjectUuid).toBe(projectUuid);
});

test('sets default framework to catalyst', async () => {
  const projectJsonPath = join(tmpDir, '.bigcommerce/project.json');

  await mkdir(dirname(projectJsonPath), { recursive: true });
  await writeFile(projectJsonPath, JSON.stringify({}));

  expect(config.get('framework')).toBe('catalyst');
});
