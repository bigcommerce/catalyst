import { execa } from 'execa';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { copyToClipboard } from './clipboard';

vi.mock('execa', () => ({ execa: vi.fn() }));

const execaMock = vi.mocked(execa);

function withPlatform(value: NodeJS.Platform): () => void {
  const previous = Object.getOwnPropertyDescriptor(process, 'platform');

  Object.defineProperty(process, 'platform', { value, configurable: true });

  return () => {
    if (previous) {
      Object.defineProperty(process, 'platform', previous);
    }
  };
}

function withWaylandDisplay(value: string | undefined): () => void {
  const previous = process.env.WAYLAND_DISPLAY;

  if (value === undefined) {
    delete process.env.WAYLAND_DISPLAY;
  } else {
    process.env.WAYLAND_DISPLAY = value;
  }

  return () => {
    if (previous === undefined) {
      delete process.env.WAYLAND_DISPLAY;
    } else {
      process.env.WAYLAND_DISPLAY = previous;
    }
  };
}

let restore: Array<() => void> = [];

afterEach(() => {
  restore.forEach((fn) => fn());
  restore = [];
  vi.clearAllMocks();
});

describe('copyToClipboard', () => {
  test('uses pbcopy on macOS', async () => {
    restore.push(withPlatform('darwin'));

    const result = await copyToClipboard('CODE');

    expect(result).toBe(true);
    expect(execaMock).toHaveBeenCalledWith('pbcopy', [], { input: 'CODE' });
  });

  test('uses clip on Windows', async () => {
    restore.push(withPlatform('win32'));

    const result = await copyToClipboard('CODE');

    expect(result).toBe(true);
    expect(execaMock).toHaveBeenCalledWith('clip', [], { input: 'CODE' });
  });

  test('uses wl-copy on Wayland Linux sessions', async () => {
    restore.push(withPlatform('linux'), withWaylandDisplay('wayland-0'));

    const result = await copyToClipboard('CODE');

    expect(result).toBe(true);
    expect(execaMock).toHaveBeenCalledWith('wl-copy', [], { input: 'CODE' });
  });

  test('uses xclip on X11 Linux sessions', async () => {
    restore.push(withPlatform('linux'), withWaylandDisplay(undefined));

    const result = await copyToClipboard('CODE');

    expect(result).toBe(true);
    expect(execaMock).toHaveBeenCalledWith('xclip', ['-selection', 'clipboard'], { input: 'CODE' });
  });

  test('returns false on unsupported platforms without spawning anything', async () => {
    restore.push(withPlatform('aix'));

    const result = await copyToClipboard('CODE');

    expect(result).toBe(false);
    expect(execaMock).not.toHaveBeenCalled();
  });

  test('returns false when the clipboard utility fails', async () => {
    restore.push(withPlatform('darwin'));
    execaMock.mockRejectedValueOnce(new Error('command not found'));

    const result = await copyToClipboard('CODE');

    expect(result).toBe(false);
  });
});
