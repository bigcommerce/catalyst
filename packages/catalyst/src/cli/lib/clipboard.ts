import { execa } from 'execa';

interface ClipboardCommand {
  command: string;
  args: string[];
}

// Resolve the platform-native clipboard utility. Returns null when we don't
// know how to reach the clipboard on this platform, so callers can fall back to
// simply printing the value.
function clipboardCommand(): ClipboardCommand | null {
  switch (process.platform) {
    case 'darwin':
      return { command: 'pbcopy', args: [] };

    case 'win32':
      return { command: 'clip', args: [] };

    case 'linux':
      // Wayland sessions expose wl-copy; X11 sessions typically ship xclip.
      return process.env.WAYLAND_DISPLAY
        ? { command: 'wl-copy', args: [] }
        : { command: 'xclip', args: ['-selection', 'clipboard'] };

    default:
      return null;
  }
}

// Best-effort copy of `text` to the system clipboard. Never throws — returns
// `true` on success and `false` when the clipboard is unreachable (unknown
// platform, missing utility, spawn failure). Callers must always print the
// value as a fallback so the flow works even when the copy fails.
export async function copyToClipboard(text: string): Promise<boolean> {
  const clipboard = clipboardCommand();

  if (!clipboard) {
    return false;
  }

  try {
    await execa(clipboard.command, clipboard.args, { input: text });

    return true;
  } catch {
    return false;
  }
}
