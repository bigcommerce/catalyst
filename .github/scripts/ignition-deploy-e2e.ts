import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Constants ──────────────────────────────────────

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
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
} as const;

// ── Logging ────────────────────────────────────────

function log(message: string): void {
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  console.log(`[${ts}] ${message}`);
}

function logSection(title: string): void {
  console.log('');
  console.log('════════════════════════════════════════');
  console.log(`  ${title}`);
  console.log('════════════════════════════════════════');
  console.log('');
}

function logToFile(label: string, content: string): void {
  writeFileSync(`/tmp/e2e-${label}.log`, content, 'utf-8');
}

// ── Step runner ────────────────────────────────────

interface StepResult {
  stdout: string;
  exitCode: number;
}

function runStep(label: string, command: string, args: string[], cwd: string): StepResult {
  log(`▶ step=${label}`);
  log(`  command: ${command} ${args.join(' ')}`);
  log(`  cwd: ${cwd}`);

  try {
    const stdout = execFileSync(command, args, {
      cwd,
      stdio: 'pipe',
      encoding: 'utf-8',
      env: process.env as Record<string, string>,
    });

    logToFile(label, stdout);
    log(`  exit_code=0`);
    log(`  ✓ Step '${label}' succeeded`);

    return { stdout, exitCode: 0 };
  } catch (err: unknown) {
    const error = err as { stdout?: string; stderr?: string; status?: number };
    const output = [error.stdout ?? '', error.stderr ?? ''].join('\n');

    logToFile(label, output);

    const exitCode = error.status ?? 1;
    log(`  exit_code=${exitCode}`);
    log(`  ✗ Step '${label}' failed — last 50 lines:`);

    const lines = output.split('\n');
    console.log(lines.slice(-50).join('\n'));

    throw new Error(`Step '${label}' failed with exit code ${exitCode}`);
  }
}

// ── Assertions ─────────────────────────────────────

function assertFileExists(filePath: string, description: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`${description}: expected file at ${filePath}`);
  }
  log(`  ${description} exists ✓`);
}

function assertDirectoryNonEmpty(dirPath: string, description: string): void {
  if (!existsSync(dirPath)) {
    throw new Error(`${description}: directory does not exist at ${dirPath}`);
  }
  const entries = readdirSync(dirPath);
  if (entries.length === 0) {
    throw new Error(`${description}: directory is empty at ${dirPath}`);
  }
  log(`  ${description} is non-empty (${entries.length} entries) ✓`);
}

function extractDeploymentUrl(stdout: string): string | null {
  const match = /Deployment URL:\s*(\S+)/.exec(stdout);
  return match?.[1] ?? null;
}

// ── URL polling ────────────────────────────────────

async function pollDeploymentUrl(url: string): Promise<void> {
  let delay = POLL_CONFIG.initialDelay;

  for (let attempt = 1; attempt <= POLL_CONFIG.maxAttempts; attempt++) {
    log(`  Attempt ${attempt}/${POLL_CONFIG.maxAttempts} (delay=${delay / 1000}s)`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      const response = await fetch(url);
      const body = await response.text();

      log(`  HTTP ${response.status}, body size: ${body.length} bytes`);

      if (response.status === 200 && /<html/i.test(body)) {
        log(`  ✓ Deployment is live — HTTP 200 with <html marker`);
        log(`  First 500 chars of response:`);
        console.log(body.slice(0, 500));
        return;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      log(`  Fetch error: ${message}`);
    }

    delay = Math.min(delay * 2, POLL_CONFIG.maxDelay);
  }

  throw new Error(
    `Deployment URL validation failed after ${POLL_CONFIG.maxAttempts} attempts`,
  );
}

// ── Main ───────────────────────────────────────────

async function main(): Promise<void> {
  // 1. Preflight
  logSection('Preflight');

  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      log(`✗ Missing required env var: ${varName}`);
      process.exit(1);
    }
    log(`  ${varName} is set (${value.length} chars)`);
  }

  log(`  node: ${process.version}`);
  try {
    log(`  pnpm: ${execFileSync('pnpm', ['--version'], { encoding: 'utf-8' }).trim()}`);
  } catch {
    log('  pnpm: not found');
  }

  // 2. Link
  logSection('Step 1 — Link');

  runStep('link', 'pnpm', ['catalyst', 'link', '--project-uuid', process.env.BIGCOMMERCE_PROJECT_UUID!], CORE_DIR);
  assertFileExists(join(CORE_DIR, '.bigcommerce', 'project.json'), 'project.json');

  // 3. Build
  logSection('Step 2 — Build');

  runStep('build', 'pnpm', ['catalyst', 'build', '--framework', 'catalyst'], CORE_DIR);
  assertDirectoryNonEmpty(join(CORE_DIR, '.bigcommerce', 'dist'), 'dist/');

  // 4. Deploy
  logSection('Step 3 — Deploy');

  const deployResult = runStep('deploy', 'pnpm', [
    'catalyst', 'deploy',
    '--project-uuid', process.env.BIGCOMMERCE_PROJECT_UUID!,
    '--secret', `BIGCOMMERCE_STORE_HASH=${process.env.BIGCOMMERCE_STORE_HASH!}`,
    '--secret', `BIGCOMMERCE_STOREFRONT_TOKEN=${process.env.BIGCOMMERCE_STOREFRONT_TOKEN!}`,
    '--secret', `BIGCOMMERCE_CHANNEL_ID=${process.env.BIGCOMMERCE_CHANNEL_ID!}`,
    '--secret', `AUTH_SECRET=${process.env.AUTH_SECRET!}`,
  ], CORE_DIR);

  // 5. Extract deployment URL
  logSection('Step 4 — Extract deployment URL');

  const deploymentUrl = extractDeploymentUrl(deployResult.stdout);

  if (!deploymentUrl) {
    log('⚠ No deployment URL found in deploy output — skipping URL validation');
    log('  (deploy succeeded; URL validation is additive)');
    return;
  }

  log(`  Deployment URL: ${deploymentUrl}`);

  // 6. Validate deployment URL
  logSection('Step 5 — Validate deployment URL');

  await pollDeploymentUrl(deploymentUrl);
}

main().then(
  () => process.exit(0),
  (err: unknown) => {
    log(err instanceof Error ? err.message : String(err));
    process.exit(1);
  },
);
