import { execa } from 'execa';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { installDependencies } from './install-dependencies';

vi.mock('execa', () => ({ execa: vi.fn() }));
vi.mock('yocto-spinner', () => ({
  default: () => ({ start: () => ({ success: vi.fn(), error: vi.fn() }) }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('installDependencies', () => {
  it('runs the package manager by name, not through corepack', async () => {
    await installDependencies('/tmp/project', 'pnpm');

    expect(execa).toHaveBeenCalledWith('pnpm', ['install'], {
      cwd: '/tmp/project',
      stdin: 'ignore',
      env: { NODE_NO_WARNINGS: '1', COREPACK_ENABLE_DOWNLOAD_PROMPT: '0' },
    });
  });

  it('defaults to pnpm', async () => {
    await installDependencies('/tmp/project');

    expect(execa).toHaveBeenCalledWith('pnpm', ['install'], expect.anything());
  });

  it('rethrows install failures', async () => {
    vi.mocked(execa).mockRejectedValueOnce(new Error('install failed'));

    await expect(installDependencies('/tmp/project', 'npm')).rejects.toThrow('install failed');
  });
});
