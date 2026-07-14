import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { writeEnv } from './write-env';

// A trimmed-down stand-in for core/.env.example: one blank documented key, one
// documented key with a default value, each with its own leading comment block.
const EXAMPLE = `# Store hash comment.
BIGCOMMERCE_STORE_HASH=

# Channel id comment.
BIGCOMMERCE_CHANNEL_ID=1

# Admin route comment.
ENABLE_ADMIN_ROUTE=true
`;

let projectDir: string;

const writeExample = (contents: string) => {
  writeFileSync(join(projectDir, '.env.example'), contents);
};

const writeLocal = (contents: string) => {
  writeFileSync(join(projectDir, '.env.local'), contents);
};

const readLocal = () => readFileSync(join(projectDir, '.env.local'), 'utf-8');

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'catalyst-write-env-test-'));
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

describe('writeEnv', () => {
  it('follows .env.example ordering and preserves each key comment block', () => {
    writeExample(EXAMPLE);

    writeEnv(projectDir, {
      BIGCOMMERCE_STORE_HASH: 'abc123',
      BIGCOMMERCE_CHANNEL_ID: '42',
    });

    expect(readLocal()).toBe(
      `# Store hash comment.
BIGCOMMERCE_STORE_HASH=abc123

# Channel id comment.
BIGCOMMERCE_CHANNEL_ID=42

# Admin route comment.
ENABLE_ADMIN_ROUTE=true
`,
    );
  });

  it('renders documented keys that were not supplied using the example line', () => {
    writeExample(EXAMPLE);

    // Only supply the store hash — the other two keep the example's own line, so
    // the blank placeholder and the `=1` default both survive.
    writeEnv(projectDir, { BIGCOMMERCE_STORE_HASH: 'abc123' });

    const local = readLocal();

    expect(local).toContain('BIGCOMMERCE_STORE_HASH=abc123');
    expect(local).toContain('BIGCOMMERCE_CHANNEL_ID=1');
    expect(local).toContain('ENABLE_ADMIN_ROUTE=true');
  });

  it('appends keys not present in .env.example in a separated trailing section', () => {
    writeExample(EXAMPLE);

    writeEnv(projectDir, {
      BIGCOMMERCE_STORE_HASH: 'abc123',
      CATALYST_ACCESS_TOKEN: 'tok_secret',
    });

    expect(readLocal()).toBe(
      `# Store hash comment.
BIGCOMMERCE_STORE_HASH=abc123

# Channel id comment.
BIGCOMMERCE_CHANNEL_ID=1

# Admin route comment.
ENABLE_ADMIN_ROUTE=true

# Additional variables set by the Catalyst CLI (not in .env.example).
CATALYST_ACCESS_TOKEN=tok_secret
`,
    );
  });

  it('preserves existing user values that the CLI does not supply on a re-run', () => {
    writeExample(EXAMPLE);
    writeLocal(
      `BIGCOMMERCE_STORE_HASH=old_hash
BIGCOMMERCE_CHANNEL_ID=7
ENABLE_ADMIN_ROUTE=false
`,
    );

    // Re-link a channel: only the channel-specific keys are supplied.
    writeEnv(projectDir, {
      BIGCOMMERCE_STORE_HASH: 'new_hash',
      BIGCOMMERCE_CHANNEL_ID: '9',
    });

    const local = readLocal();

    // Supplied keys are updated in place...
    expect(local).toContain('BIGCOMMERCE_STORE_HASH=new_hash');
    expect(local).toContain('BIGCOMMERCE_CHANNEL_ID=9');
    // ...while the user's untouched value is preserved (not reset to default).
    expect(local).toContain('ENABLE_ADMIN_ROUTE=false');
  });

  it('does not clobber an existing value when the CLI supplies an empty placeholder', () => {
    // The channel init API returns blank placeholders for keys it does not own
    // (e.g. MAKESWIFT_SITE_API_KEY). Those must not wipe a value the user
    // already set on disk.
    writeExample(`# Store hash comment.
BIGCOMMERCE_STORE_HASH=

# Makeswift comment.
MAKESWIFT_SITE_API_KEY=
`);
    writeLocal(`BIGCOMMERCE_STORE_HASH=old_hash
MAKESWIFT_SITE_API_KEY=user_makeswift_key
`);

    writeEnv(projectDir, {
      BIGCOMMERCE_STORE_HASH: 'new_hash',
      MAKESWIFT_SITE_API_KEY: '',
    });

    const local = readLocal();

    expect(local).toContain('BIGCOMMERCE_STORE_HASH=new_hash');
    // The empty CLI value falls back to the user's existing value.
    expect(local).toContain('MAKESWIFT_SITE_API_KEY=user_makeswift_key');
  });

  it('reconciles a stale .env.local by inserting a newly documented key in canonical position', () => {
    // The existing file predates ENABLE_ADMIN_ROUTE being documented and also
    // carries an unknown key the user added by hand.
    writeExample(EXAMPLE);
    writeLocal(
      `BIGCOMMERCE_STORE_HASH=abc123
BIGCOMMERCE_CHANNEL_ID=1
MY_CUSTOM_KEY=custom_value
`,
    );

    writeEnv(projectDir, {});

    expect(readLocal()).toBe(
      `# Store hash comment.
BIGCOMMERCE_STORE_HASH=abc123

# Channel id comment.
BIGCOMMERCE_CHANNEL_ID=1

# Admin route comment.
ENABLE_ADMIN_ROUTE=true

# Additional variables set by the Catalyst CLI (not in .env.example).
MY_CUSTOM_KEY=custom_value
`,
    );
  });

  it('preserves the ordering of existing unknown keys ahead of newly supplied ones', () => {
    writeExample(EXAMPLE);
    writeLocal(
      `EXISTING_UNKNOWN_A=a
EXISTING_UNKNOWN_B=b
`,
    );

    writeEnv(projectDir, { NEW_UNKNOWN: 'c' });

    const local = readLocal();
    const indexA = local.indexOf('EXISTING_UNKNOWN_A=a');
    const indexB = local.indexOf('EXISTING_UNKNOWN_B=b');
    const indexNew = local.indexOf('NEW_UNKNOWN=c');

    expect(indexA).toBeGreaterThan(-1);
    expect(indexB).toBeGreaterThan(indexA);
    expect(indexNew).toBeGreaterThan(indexB);
  });

  it('falls back to a flat merge when .env.example is absent', () => {
    writeLocal(`EXISTING=keep\n`);

    writeEnv(projectDir, { SUPPLIED: 'value' });

    const local = readLocal();

    expect(local).toContain('EXISTING=keep');
    expect(local).toContain('SUPPLIED=value');
  });
});
