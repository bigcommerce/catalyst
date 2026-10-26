import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const ignoredDirs = new Set(['node_modules', '.next', '.open-next', 'tests']);
// Runs while Next.js loads its config, outside the Data Cache and any request scope.
const ignoredFiles = new Set(['next.config.ts']);

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirs.has(entry.name) ? [] : sourceFiles(path);
    }

    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.spec.ts') ? [path] : [];
  });

const callArguments = (source: string, openParen: number) => {
  let depth = 0;

  for (let i = openParen; i < source.length; i += 1) {
    if (source[i] === '(') depth += 1;

    if (source[i] === ')') {
      depth -= 1;

      if (depth === 0) return source.slice(openParen, i + 1);
    }
  }

  return source.slice(openParen);
};

describe('client.fetch calls', () => {
  // `[locale]/layout.tsx` sets `fetchCache = 'default-cache'`, so a call without an explicit
  // cache option is stored in the Data Cache forever and never forwards the shopper IP.
  it('all pass explicit fetchOptions', () => {
    const missing = sourceFiles(root).flatMap((file) => {
      const name = relative(root, file);

      if (ignoredFiles.has(name)) return [];

      const source = readFileSync(file, 'utf8');

      return [...source.matchAll(/\bclient\.fetch\(/g)]
        .filter(
          ({ index }) =>
            !callArguments(source, index + 'client.fetch'.length).includes('fetchOptions'),
        )
        .map(({ index }) => `${name}:${source.slice(0, index).split('\n').length}`);
    });

    expect(missing).toEqual([]);
  });
});
