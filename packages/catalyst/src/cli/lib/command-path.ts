import { type CommandUnknownOpts } from '@commander-js/extra-typings';

// The full command path without the program name, e.g. `projects list`.
export function getCommandPath(cmd: CommandUnknownOpts): string {
  const parts: string[] = [];
  let current: CommandUnknownOpts | null = cmd;

  while (current.parent) {
    parts.unshift(current.name());
    current = current.parent;
  }

  return parts.join(' ');
}
