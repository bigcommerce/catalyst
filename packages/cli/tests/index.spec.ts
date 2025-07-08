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
  });

  test('all commands accept authentication options', () => {
    const commands = program.commands;
    const exemptCommands = ['version'];

    commands.forEach((command) => {
      if (exemptCommands.includes(command.name())) {
        return;
      }

      const storeHashOption = command.options.find((option) => option.long === '--store-hash');
      const accessTokenOption = command.options.find((option) => option.long === '--access-token');

      expect(
        storeHashOption,
        `Command "${command.name()}" missing --store-hash option`,
      ).toBeDefined();
      expect(
        storeHashOption?.envVar,
        `Command "${command.name()}" --store-hash missing envVar`,
      ).toBe('BIGCOMMERCE_STORE_HASH');

      expect(
        accessTokenOption,
        `Command "${command.name()}" missing --access-token option`,
      ).toBeDefined();
      expect(
        accessTokenOption?.envVar,
        `Command "${command.name()}" --access-token missing envVar`,
      ).toBe('BIGCOMMERCE_ACCESS_TOKEN');
    });
  });
});
