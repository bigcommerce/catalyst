import { Command } from '@commander-js/extra-typings';
import { describe, expect, test } from 'vitest';

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
    expect(commands).toContain('build');
    expect(commands).toContain('deploy');
    expect(commands).toContain('dev');
  });
});
