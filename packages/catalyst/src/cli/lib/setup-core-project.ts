import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { z } from 'zod';

import PACKAGE_INFO from '../../../package.json';

import { sortPackageJsonFields } from './sort-package-json';

const corePackageJsonSchema = z.looseObject({
  scripts: z.record(z.string(), z.string()).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
});

const writeJson = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

// Wires Catalyst CLI scripts and the `@bigcommerce/catalyst` dep into a freshly
// cloned `core/`. Always runs at create time, regardless of hosting choice —
// `catalyst build` / `catalyst start` / `catalyst deploy` dispatch on project
// state, so these scripts work for self-hosted projects too without rewrite.
export const setupCoreProject = (projectDir: string) => {
  const corePackageJsonPath = join(projectDir, 'core', 'package.json');
  const pkg = corePackageJsonSchema.parse(JSON.parse(readFileSync(corePackageJsonPath, 'utf-8')));

  pkg.scripts = {
    ...pkg.scripts,
    build: 'npm run generate && catalyst build',
    start: 'catalyst start',
    deploy: 'npm run generate && catalyst deploy',
  };

  pkg.dependencies = {
    ...pkg.dependencies,
    '@bigcommerce/catalyst': PACKAGE_INFO.version,
  };

  writeJson(corePackageJsonPath, sortPackageJsonFields(pkg));
};
