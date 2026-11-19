import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { rewriteCorePackage } from './rewrite-core-package';

let projectDir: string;

const readPkg = (): unknown => JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf-8'));
const workspacePath = () => join(projectDir, 'pnpm-workspace.yaml');

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'catalyst-rewrite-core-'));
  writeFileSync(
    join(projectDir, 'package.json'),
    JSON.stringify({ name: '@bigcommerce/catalyst-core', version: '1.0.0', private: true }),
  );
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe('rewriteCorePackage build allowlist', () => {
  it('writes allowBuilds to pnpm-workspace.yaml on pnpm 11+', async () => {
    vi.stubEnv('npm_config_user_agent', 'pnpm/12.9.0 npm/? node/v24.11.0 darwin arm64');

    await rewriteCorePackage(projectDir, 'canary', 'pnpm');

    expect(readPkg()).not.toHaveProperty('pnpm');
    expect(readFileSync(workspacePath(), 'utf-8')).toContain(
      "allowBuilds:\n  '@parcel/watcher': true\n",
    );
  });

  it('treats an unknown pnpm version as current', async () => {
    vi.stubEnv('npm_config_user_agent', '');

    await rewriteCorePackage(projectDir, 'canary', 'pnpm');

    expect(existsSync(workspacePath())).toBe(true);
  });

  it('writes pnpm.onlyBuiltDependencies to package.json on pnpm 10', async () => {
    vi.stubEnv('npm_config_user_agent', 'pnpm/10.12.4 npm/? node/v24.11.0 darwin arm64');

    await rewriteCorePackage(projectDir, 'canary', 'pnpm');

    expect(readPkg()).toHaveProperty(
      'pnpm.onlyBuiltDependencies',
      expect.arrayContaining(['@swc/core']),
    );
    expect(existsSync(workspacePath())).toBe(false);
  });

  it('keeps the package.json field and skips pnpm-workspace.yaml for other managers', async () => {
    vi.stubEnv('npm_config_user_agent', 'npm/11.6.1 node/v24.11.0 darwin arm64 workspaces/false');

    await rewriteCorePackage(projectDir, 'canary', 'npm');

    expect(readPkg()).toHaveProperty('pnpm.onlyBuiltDependencies');
    expect(readPkg()).toHaveProperty('trustedDependencies', expect.arrayContaining(['sharp']));
    expect(existsSync(workspacePath())).toBe(false);
  });

  it('leaves an existing pnpm-workspace.yaml alone', async () => {
    vi.stubEnv('npm_config_user_agent', 'pnpm/12.9.0 npm/? node/v24.11.0 darwin arm64');
    writeFileSync(workspacePath(), 'allowBuilds: {}\n');

    await rewriteCorePackage(projectDir, 'canary', 'pnpm');

    expect(readFileSync(workspacePath(), 'utf-8')).toBe('allowBuilds: {}\n');
  });
});
