import { Command } from 'commander';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { build } from '../../../src/commands/build';
import { action } from '../../../src/commands/build/action';

vi.mock('../../../src/commands/build/action', () => ({
  action: vi.fn(),
}));

describe('command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('accepts correct options', () => {
    const options = build.options.map((o) => o.long);

    expect(options).toEqual(expect.arrayContaining(['--verbose', '--framework']));
    expect(options.length).toBe(2);
  });

  test('defaults verbose to false', () => {
    const options = build.optsWithGlobals();

    expect(options.verbose).toBe(false);
  });

  test('restricts framework to catalyst or nextjs', () => {
    const noop = () => {
      // noop to silence output during test runs
    };

    const program = new Command();

    program.addCommand(build);
    program.exitOverride();
    program.configureOutput({
      writeOut: noop,
      writeErr: noop,
    });

    build.configureOutput({
      writeOut: noop,
      writeErr: noop,
      outputError: noop,
    });

    expect(() => program.parse(['build', '--framework', 'invalid'], { from: 'user' })).toThrow();

    expect(action).not.toHaveBeenCalled();
  });
});
