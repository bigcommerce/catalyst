import { Command } from '@commander-js/extra-typings';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('./hooks/telemetry', () => ({
  telemetryPreHook: vi.fn().mockResolvedValue(undefined),
  telemetryPostHook: vi.fn().mockResolvedValue(undefined),
}));

import { telemetryPostHook, telemetryPreHook } from './hooks/telemetry';
import { mkTempDir } from './lib/mk-temp-dir';
import { program } from './program';

describe('CLI program', () => {
  test('properly configured', () => {
    expect(program).toBeInstanceOf(Command);
    expect(program.name()).toBe(process.env.npm_package_name);
    expect(program.version()).toBe(process.env.npm_package_version);
    expect(program.description()).toContain('CLI tool for Catalyst development');
  });

  test('has expected commands', () => {
    const commands = program.commands.map((cmd) => cmd.name());

    expect(commands).toContain('version');
    expect(commands).toContain('start');
    expect(commands).toContain('build');
    expect(commands).toContain('deploy');
    expect(commands).toContain('project');
    expect(commands).toContain('auth');
    expect(commands).toContain('logs');

    const projectCmd = program.commands.find((cmd) => cmd.name() === 'project');

    expect(projectCmd?.commands.map((c) => c.name())).toEqual(
      expect.arrayContaining(['create', 'list', 'link']),
    );

    const authCmd = program.commands.find((cmd) => cmd.name() === 'auth');

    expect(authCmd?.commands.map((c) => c.name())).toEqual(
      expect.arrayContaining(['whoami', 'login', 'logout']),
    );

    const logsCmd = program.commands.find((cmd) => cmd.name() === 'logs');

    expect(logsCmd?.commands.map((c) => c.name())).toEqual(
      expect.arrayContaining(['tail', 'query']),
    );
  });

  test('telemetry hooks are called when executing version command', async () => {
    vi.mocked(telemetryPreHook).mockClear();
    vi.mocked(telemetryPostHook).mockClear();

    await program.parseAsync(['version'], { from: 'user' });

    expect(telemetryPreHook).toHaveBeenCalledTimes(1);
    expect(telemetryPostHook).toHaveBeenCalledTimes(1);

    expect(telemetryPreHook).toHaveBeenCalledWith(expect.any(Command), expect.any(Command));
  });
});

describe('env-file loading', () => {
  afterEach(() => {
    delete process.env.CATALYST_STORE_HASH;
    delete process.env.CATALYST_ACCESS_TOKEN;
  });

  test('--env-path is not a global option', () => {
    const hasGlobalEnvPath = program.options.some((option) => option.long === '--env-path');

    expect(hasGlobalEnvPath).toBe(false);
  });

  test('build and deploy expose an --env-path option', () => {
    ['build', 'deploy'].forEach((name) => {
      const command = program.commands.find((cmd) => cmd.name() === name);

      expect(command?.options.some((option) => option.long === '--env-path')).toBe(true);
    });
  });

  test('a non-build command does not load a .env.local from cwd', async () => {
    const [tmpDir, cleanup] = await mkTempDir('catalyst-env-path-');
    const envPath = join(tmpDir, '.env.local');

    await writeFile(
      envPath,
      'CATALYST_STORE_HASH=should-not-load\nCATALYST_ACCESS_TOKEN=should-not-load',
      'utf-8',
    );

    const originalCwd = process.cwd();

    process.chdir(tmpDir);

    try {
      await program.parseAsync(['version'], { from: 'user' });

      expect(process.env.CATALYST_STORE_HASH).toBeUndefined();
      expect(process.env.CATALYST_ACCESS_TOKEN).toBeUndefined();
    } finally {
      process.chdir(originalCwd);
      await cleanup();
    }
  });
});
