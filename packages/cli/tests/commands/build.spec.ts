import { Command } from 'commander';
import { expect, test } from 'vitest';

import { build } from '../../src/commands/build';

test('properly configured Command instance', () => {
  expect(build).toBeInstanceOf(Command);
  expect(build.name()).toBe('build');
  expect(build.options).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ long: '--framework' }),
      expect.objectContaining({ long: '--project-uuid' }),
    ]),
  );
});
