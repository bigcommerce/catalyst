import { exec } from 'child_process';
import { Command } from 'commander';
import { outputFileSync, writeJsonSync } from 'fs-extra/esm';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { consola } from '../lib/logger';
import { program } from '../program';

import { integration } from './integration';

// Mock git: reply with canned output keyed off the command string. The source
// ref resolves to `feature-branch` (from `git rev-parse`) and the latest core
// tag to `@bigcommerce/catalyst-core@2.0.0`. The integration ref adds `new-dep`,
// `new-dev`, and `NEW_ENV` on top of the base tag.
vi.mock('child_process', () => ({
  exec: vi.fn(
    (cmd: string, cb: (err: Error | null, res: { stdout: string; stderr: string }) => void) => {
      const reply = (stdout: string) => cb(null, { stdout, stderr: '' });

      if (cmd.includes('rev-parse')) {
        reply('feature-branch\n');

        return;
      }

      if (cmd.includes('tag --list')) {
        reply('@bigcommerce/catalyst-core@1.0.0\n@bigcommerce/catalyst-core@2.0.0\n');

        return;
      }

      if (cmd.includes('git diff')) {
        reply('PATCH_CONTENTS\n');

        return;
      }

      if (cmd.includes(':core/package.json')) {
        if (cmd.includes('feature-branch')) {
          reply(
            JSON.stringify({
              dependencies: { shared: '1.0.0', 'new-dep': '1.0.0' },
              devDependencies: { 'shared-dev': '1.0.0', 'new-dev': '1.0.0' },
            }),
          );

          return;
        }

        reply(
          JSON.stringify({
            dependencies: { shared: '1.0.0' },
            devDependencies: { 'shared-dev': '1.0.0' },
          }),
        );

        return;
      }

      if (cmd.includes(':core/.env.example')) {
        if (cmd.includes('feature-branch')) {
          reply('SHARED=1\nNEW_ENV=2\n');

          return;
        }

        reply('SHARED=1\n');

        return;
      }

      // `git fetch --tags` and anything else.
      reply('');
    },
  ),
}));

vi.mock('fs-extra/esm', () => ({
  outputFileSync: vi.fn(),
  writeJsonSync: vi.fn(),
}));

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

test('properly configured Command instance', () => {
  expect(integration).toBeInstanceOf(Command);
  expect(integration.name()).toBe('integration');
  expect(integration.description()).toContain('Generate an integration patch and manifest');
});

describe('integration', () => {
  test('writes a manifest and patch from the diff against the latest core release', async () => {
    await program.parseAsync(['node', 'catalyst', 'integration', 'My Integration']);

    expect(writeJsonSync).toHaveBeenCalledWith(
      'integrations/my-integration/manifest.json',
      {
        name: 'my-integration',
        dependencies: { add: ['new-dep'] },
        devDependencies: { add: ['new-dev'] },
        environmentVariables: ['NEW_ENV'],
      },
      { spaces: 2 },
    );

    expect(outputFileSync).toHaveBeenCalledWith(
      'integrations/my-integration/integration.patch',
      'PATCH_CONTENTS\n',
    );

    expect(consola.success).toHaveBeenCalledWith('Integration created successfully.');
  });

  test('diffs against the latest core tag and the resolved source ref', async () => {
    await program.parseAsync(['node', 'catalyst', 'integration', 'my-integration']);

    expect(vi.mocked(exec)).toHaveBeenCalledWith(
      "git diff @bigcommerce/catalyst-core@2.0.0...feature-branch -- ':(exclude)core/package.json' ':(exclude)pnpm-lock.yaml'",
      expect.any(Function),
    );
  });

  test('--commit-hash overrides the source ref', async () => {
    await program.parseAsync([
      'node',
      'catalyst',
      'integration',
      'my-integration',
      '--commit-hash',
      'abc1234',
    ]);

    const diffCall = vi
      .mocked(exec)
      .mock.calls.find(([cmd]) => typeof cmd === 'string' && cmd.startsWith('git diff'));

    expect(diffCall?.[0]).toContain('@bigcommerce/catalyst-core@2.0.0...abc1234');
  });
});
