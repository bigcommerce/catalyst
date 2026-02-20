import { Command } from 'commander';
import { expect, test, vi } from 'vitest';

import { build } from './build';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
vi.spyOn(process, 'exit').mockImplementation(() => null as never);

test('properly configured Command instance', () => {
  expect(build).toBeInstanceOf(Command);
  expect(build.name()).toBe('build');
  expect(build.options).toEqual(
    expect.arrayContaining([expect.objectContaining({ long: '--project-uuid' })]),
  );
});
