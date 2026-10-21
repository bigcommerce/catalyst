import { Command } from '@commander-js/extra-typings';
import { expect, test } from 'vitest';

import { getCommandPath } from './command-path';

test('returns the subcommand path without the program name', () => {
  const list = new Command('list');

  new Command('catalyst').addCommand(new Command('projects').addCommand(list));

  expect(getCommandPath(list)).toBe('projects list');
});

test('returns an empty string for the program itself', () => {
  expect(getCommandPath(new Command('catalyst'))).toBe('');
});
