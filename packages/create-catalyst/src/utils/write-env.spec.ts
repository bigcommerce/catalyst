import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { writeEnv } from './write-env';

describe('writeEnv', () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'create-catalyst-write-env-'));
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  const readEnvLocal = () => readFileSync(join(projectDir, '.env.local'), 'utf-8');

  it('writes each entry as KEY=VALUE on its own line', () => {
    writeEnv(projectDir, { FOO: 'bar', BAZ: 'qux' });

    expect(readEnvLocal()).toBe('FOO=bar\nBAZ=qux\n');
  });

  it('writes both BIGCOMMERCE_STOREFRONT_TOKEN and BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN when both are present', () => {
    writeEnv(projectDir, {
      BIGCOMMERCE_STOREFRONT_TOKEN: 'authenticated-token-value',
      BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN: 'unauthenticated-token-value',
    });

    const contents = readEnvLocal();

    expect(contents).toContain('BIGCOMMERCE_STOREFRONT_TOKEN=authenticated-token-value');
    expect(contents).toContain(
      'BIGCOMMERCE_STOREFRONT_UNAUTHENTICATED_TOKEN=unauthenticated-token-value',
    );
  });

  it('passes arbitrary keys through without filtering', () => {
    writeEnv(projectDir, {
      BIGCOMMERCE_STORE_HASH: 'abc123',
      A_FUTURE_KEY_FROM_THE_BACKEND: 'whatever',
    });

    expect(readEnvLocal()).toContain('A_FUTURE_KEY_FROM_THE_BACKEND=whatever');
  });
});
