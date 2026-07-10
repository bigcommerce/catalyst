import { outputFileSync } from 'fs-extra/esm';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Matches an "active" env assignment — `KEY=VALUE` that isn't commented out.
// The value is captured greedily (and may be empty) so blank documented keys
// like `KEY=` still parse and `KEY=a=b` keeps the full value.
const ACTIVE_KEY_LINE = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/;

const keyFromLine = (line: string): string | null => {
  const match = ACTIVE_KEY_LINE.exec(line);

  return match ? match[1] : null;
};

// Parse a .env-style body into an ordered KEY -> VALUE map, skipping comments
// and blank lines. Last assignment wins, matching dotenv semantics.
const parseEnvValues = (contents: string): Map<string, string> => {
  const values = new Map<string, string>();

  contents.split('\n').forEach((line) => {
    const match = ACTIVE_KEY_LINE.exec(line);

    if (match) {
      values.set(match[1], match[2]);
    }
  });

  return values;
};

// Writes .env.local at the project root — Next.js (and all the catalyst CLI
// commands) read env vars from there, since the extracted project is the package
// they run inside.
//
// `.env.example` (shipped with the scaffolded project) is the source of truth
// for shape: the generated `.env.local` mirrors its ordering and per-key comment
// blocks so the file stays self-documenting. Values supplied by the CLI are
// substituted in place; documented keys we weren't given keep the example's own
// line (blank or default) so the user still sees what's expected. Any existing
// `.env.local` is reconciled rather than clobbered — the user's current values
// are preserved unless the CLI is explicitly supplying a new one.
export const writeEnv = (projectDir: string, envVars: Record<string, string>) => {
  const examplePath = join(projectDir, '.env.example');
  const localPath = join(projectDir, '.env.local');

  const existingLocal = existsSync(localPath)
    ? parseEnvValues(readFileSync(localPath, 'utf-8'))
    : new Map<string, string>();

  // CLI-supplied vars win over what's already on disk so a re-run (e.g.
  // `channel link`) updates credentials in place; anything the CLI didn't touch
  // falls back to the user's existing value.
  const resolve = (key: string): string | undefined =>
    key in envVars ? envVars[key] : existingLocal.get(key);

  // Without a template we can't follow the documented ordering/comments, so fall
  // back to a flat merge that still preserves the user's existing values.
  if (!existsSync(examplePath)) {
    const keys = [...new Set([...existingLocal.keys(), ...Object.keys(envVars)])];

    outputFileSync(localPath, `${keys.map((key) => `${key}=${resolve(key) ?? ''}`).join('\n')}\n`);

    return;
  }

  // Drop a single trailing newline before splitting so we don't reproduce a
  // spurious blank line; the final `join` re-adds exactly one.
  const exampleLines = readFileSync(examplePath, 'utf-8').replace(/\n$/, '').split('\n');
  const exampleKeys = new Set<string>();

  const lines = exampleLines.map((line) => {
    const key = keyFromLine(line);

    // Comments and blank lines are copied verbatim, preserving each key's
    // leading comment block.
    if (key === null) {
      return line;
    }

    exampleKeys.add(key);

    const value = resolve(key);

    // Documented keys without a value keep the example's own line so defaults
    // (e.g. `BIGCOMMERCE_CHANNEL_ID=1`) and blank placeholders survive.
    return value === undefined ? line : `${key}=${value}`;
  });

  // Keys the CLI supplied — or the user already had — that the template doesn't
  // document get appended in a clearly separated section, preserving the order
  // they were first seen (existing keys first, then newly supplied ones).
  const extraKeys: string[] = [];

  [...existingLocal.keys()].forEach((key) => {
    if (!exampleKeys.has(key)) {
      extraKeys.push(key);
    }
  });

  Object.keys(envVars).forEach((key) => {
    if (!exampleKeys.has(key) && !extraKeys.includes(key)) {
      extraKeys.push(key);
    }
  });

  if (extraKeys.length > 0) {
    lines.push('', '# Additional variables set by the Catalyst CLI (not in .env.example).');

    extraKeys.forEach((key) => {
      lines.push(`${key}=${resolve(key) ?? ''}`);
    });
  }

  outputFileSync(localPath, `${lines.join('\n')}\n`);
};
