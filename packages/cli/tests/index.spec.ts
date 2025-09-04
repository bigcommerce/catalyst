import { Command } from '@commander-js/extra-typings';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../src/hooks/telemetry', () => ({
  telemetryPreHook: vi.fn().mockResolvedValue(undefined),
  telemetryPostHook: vi.fn().mockResolvedValue(undefined),
}));

import { telemetryPostHook, telemetryPreHook } from '../src/hooks/telemetry';
import { program } from '../src/program';

describe('CLI program', () => {
  test('properly configured', () => {
    expect(program).toBeInstanceOf(Command);
    expect(program.name()).toBe(process.env.npm_package_name);
    expect(program.version()).toBe(process.env.npm_package_version);
    expect(program.description()).toBe('CLI tool for Catalyst development');
  });

  test('has expected commands', () => {
    const commands = program.commands.map((cmd) => cmd.name());

    expect(commands).toContain('version');
    expect(commands).toContain('dev');
    expect(commands).toContain('start');
    expect(commands).toContain('build');
    expect(commands).toContain('deploy');
    expect(commands).toContain('link');
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
