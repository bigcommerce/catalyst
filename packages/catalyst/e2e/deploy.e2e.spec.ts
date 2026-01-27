import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execaCommand } from 'execa';
import { describe, test, expect, beforeAll } from 'vitest';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const CORE_DIR = join(REPO_ROOT, 'core');

const REQUIRED_ENV_VARS = [
  'BIGCOMMERCE_STORE_HASH',
  'BIGCOMMERCE_ACCESS_TOKEN',
  'BIGCOMMERCE_STOREFRONT_TOKEN',
  'BIGCOMMERCE_CHANNEL_ID',
  'AUTH_SECRET',
  'BIGCOMMERCE_PROJECT_UUID',
] as const;

const POLL_CONFIG = {
  initialDelay: 15_000,
  maxDelay: 120_000,
  maxAttempts: 10,
};

async function pollUrl(url: string): Promise<{ status: number; body: string }> {
  let delay = POLL_CONFIG.initialDelay;

  for (let attempt = 1; attempt <= POLL_CONFIG.maxAttempts; attempt++) {
    console.log(`  Attempt ${attempt}/${POLL_CONFIG.maxAttempts} (delay=${delay / 1000}s)`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      const response = await fetch(url);
      const body = await response.text();

      console.log(`  HTTP ${response.status}, body size: ${body.length} bytes`);

      if (response.status === 200 && /<html/i.test(body)) {
        return { status: response.status, body };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`  Fetch error: ${message}`);
    }

    delay = Math.min(delay * 2, POLL_CONFIG.maxDelay);
  }

  throw new Error(`Deployment URL did not return valid HTML after ${POLL_CONFIG.maxAttempts} attempts`);
}

describe('Ignition Deploy E2E', () => {
  let deploymentUrl: string | undefined;
  let env: Record<string, string>;

  beforeAll(() => {
    env = {} as Record<string, string>;

    for (const varName of REQUIRED_ENV_VARS) {
      const value = process.env[varName];
      if (value) {
        env[varName] = value;
      }
    }

    console.log(`node: ${process.version}`);
  });

  test('preflight — all required env vars are set', () => {
    for (const varName of REQUIRED_ENV_VARS) {
      expect(process.env[varName], `Missing env var: ${varName}`).toBeTruthy();
    }
  });

  test('link — creates project.json', async () => {
    const result = await execaCommand(
      `pnpm catalyst link --project-uuid ${env.BIGCOMMERCE_PROJECT_UUID}`,
      { cwd: CORE_DIR, reject: false, all: true, env },
    );

    console.log(result.all);
    expect(result.exitCode).toBe(0);
    expect(existsSync(join(CORE_DIR, '.bigcommerce', 'project.json'))).toBe(true);
  });

  test('build — produces dist output', async () => {
    const result = await execaCommand('pnpm catalyst build --framework catalyst', {
      cwd: CORE_DIR,
      reject: false,
      all: true,
      env,
    });

    console.log(result.all);
    expect(result.exitCode).toBe(0);

    const distDir = join(CORE_DIR, '.bigcommerce', 'dist');
    expect(existsSync(distDir)).toBe(true);
    expect(readdirSync(distDir).length).toBeGreaterThan(0);
  });

  test('deploy — exits successfully', async () => {
    const result = await execaCommand(
      [
        'pnpm catalyst deploy',
        `--project-uuid ${env.BIGCOMMERCE_PROJECT_UUID}`,
        `--secret "BIGCOMMERCE_STORE_HASH=${env.BIGCOMMERCE_STORE_HASH}"`,
        `--secret "BIGCOMMERCE_STOREFRONT_TOKEN=${env.BIGCOMMERCE_STOREFRONT_TOKEN}"`,
        `--secret "BIGCOMMERCE_CHANNEL_ID=${env.BIGCOMMERCE_CHANNEL_ID}"`,
        `--secret "AUTH_SECRET=${env.AUTH_SECRET}"`,
      ].join(' '),
      { cwd: CORE_DIR, reject: false, all: true, env },
    );

    console.log(result.all);
    expect(result.exitCode).toBe(0);

    const match = /Deployment URL:\s*(\S+)/.exec(result.all ?? '');
    if (match?.[1]) {
      deploymentUrl = match[1];
      console.log(`Deployment URL: ${deploymentUrl}`);
    }
  });

  test('deployment URL returns HTTP 200', async ({ skip }) => {
    if (!deploymentUrl) {
      skip();
      return;
    }

    const { status, body } = await pollUrl(deploymentUrl);

    expect(status).toBe(200);
    expect(body.toLowerCase()).toContain('<html');
  });
});
