import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import PACKAGE_INFO from '../../../package.json';

import { setupCoreProject } from './setup-core-project';

const packageJsonSchema = z.looseObject({
  name: z.string().optional(),
  scripts: z.record(z.string(), z.string()).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
});

let projectDir: string;

const writeCorePackageJson = (contents: unknown) => {
  writeFileSync(join(projectDir, 'package.json'), JSON.stringify(contents, null, 2));
};

const readCorePackageJson = () =>
  packageJsonSchema.parse(JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8')));

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'catalyst-setup-core-test-'));
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

describe('setupCoreProject', () => {
  it('overrides build, start, and deploy scripts to dispatch through the catalyst CLI', () => {
    writeCorePackageJson({
      scripts: {
        dev: 'npm run generate && next dev',
        generate: 'dotenv -e .env.local -- node ./scripts/generate.cjs',
        build: 'npm run generate && next build',
        start: 'next start',
      },
    });

    setupCoreProject(projectDir);

    expect(readCorePackageJson().scripts).toEqual({
      dev: 'npm run generate && next dev',
      generate: 'dotenv -e .env.local -- node ./scripts/generate.cjs',
      build: 'npm run generate && catalyst build',
      start: 'catalyst start',
      deploy: 'npm run generate && catalyst deploy',
    });
  });

  it('keeps the `npm run generate &&` prefix on build', () => {
    writeCorePackageJson({ scripts: { build: 'next build' } });

    setupCoreProject(projectDir);

    expect(readCorePackageJson().scripts?.build).toBe('npm run generate && catalyst build');
  });

  it('leaves unrelated scripts (dev, generate, lint, etc.) untouched', () => {
    writeCorePackageJson({
      scripts: {
        dev: 'npm run generate && next dev',
        generate: 'dotenv -e .env.local -- node ./scripts/generate.cjs',
        lint: 'eslint .',
        typecheck: 'tsc --noEmit',
      },
    });

    setupCoreProject(projectDir);

    expect(readCorePackageJson().scripts).toMatchObject({
      dev: 'npm run generate && next dev',
      generate: 'dotenv -e .env.local -- node ./scripts/generate.cjs',
      lint: 'eslint .',
      typecheck: 'tsc --noEmit',
    });
  });

  it('adds @bigcommerce/catalyst dep at the CLI version', () => {
    writeCorePackageJson({ dependencies: { next: '^15.0.0' } });

    setupCoreProject(projectDir);

    const pkg = readCorePackageJson();

    expect(pkg.dependencies?.['@bigcommerce/catalyst']).toBe(PACKAGE_INFO.version);
    expect(pkg.dependencies?.next).toBe('^15.0.0');
  });

  it('preserves unrelated top-level fields like name and version', () => {
    writeCorePackageJson({
      name: '@bigcommerce/catalyst-core',
      scripts: { dev: 'next dev' },
    });

    setupCoreProject(projectDir);

    expect(readCorePackageJson().name).toBe('@bigcommerce/catalyst-core');
  });
});
