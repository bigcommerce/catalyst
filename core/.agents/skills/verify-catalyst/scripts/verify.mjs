#!/usr/bin/env node
// Verification helper for Catalyst storefronts. See ../SKILL.md for how to use it.
//
// Pure Node (no shell scripts) so the same commands work on macOS, Linux, and Windows.
// It resolves Playwright and Next.js from the storefront's own node_modules, so it works
// both in the Catalyst monorepo (`core/`) and in standalone projects created with
// `create catalyst`, where the storefront is the repository root.

import { spawn, spawnSync } from 'node:child_process';
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(SCRIPT_DIR, '../../../..');
const EVIDENCE_DIR = join(APP_DIR, '.verification');
const STATE_FILE = join(EVIDENCE_DIR, 'server.json');
const IS_WINDOWS = process.platform === 'win32';
const DEFAULT_PORT = 3100;
const READY_TIMEOUT_MS = 6 * 60 * 1000;
const REQUIRED_ENV = [
  'BIGCOMMERCE_STORE_HASH',
  'BIGCOMMERCE_STOREFRONT_TOKEN',
  'BIGCOMMERCE_CHANNEL_ID',
  'AUTH_SECRET',
];
const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  tablet: { viewport: { width: 834, height: 1112 }, deviceScaleFactor: 1, hasTouch: true },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
};

// ---------------------------------------------------------------------------------------------
// Small utilities

const requireFromApp = createRequire(join(APP_DIR, 'package.json'));

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  // `.cmd` shims (pnpm, npm, npx) need a shell on Windows; real executables (git, gh, ffmpeg) do not.
  const result = spawnSync(cmd, args, {
    cwd: APP_DIR,
    encoding: 'utf8',
    shell: IS_WINDOWS && opts.shim === true,
    ...opts,
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: (result.stdout ?? '').trim(),
    stderr: (result.stderr ?? '').trim(),
    error: result.error,
  };
}

// ffmpeg only understands `-version`; git and gh accept it too.
function has(cmd) {
  return run(cmd, ['-version']).ok || run(cmd, ['--version']).ok;
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'run'
  );
}

function timestamp() {
  return new Date().toISOString().replace(/[:T]/g, '-').replace(/\..+$/, '');
}

function parseEnvFile(file) {
  if (!existsSync(file)) return {};

  const env = {};

  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match) continue;

    let value = match[2];

    if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
    else value = value.replace(/\s+#.*$/, '');

    env[match[1]] = value;
  }

  return env;
}

function readState() {
  if (!existsSync(STATE_FILE)) return null;

  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function portIsFree(port) {
  return new Promise((done) => {
    const server = createServer();

    server.once('error', () => done(false));
    server.once('listening', () => server.close(() => done(true)));
    server.listen(port);
  });
}

function layout() {
  const parent = dirname(APP_DIR);
  const monorepo =
    existsSync(join(parent, 'pnpm-workspace.yaml')) &&
    existsSync(join(parent, 'packages', 'client'));

  return { monorepo, repoRoot: monorepo ? parent : APP_DIR };
}

function git(args, opts = {}) {
  return run('git', args, opts);
}

function gitInfo() {
  const sha = git(['rev-parse', 'HEAD']).stdout;
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).stdout;
  // `next dev` rewrites agent docs (AGENTS.md) on startup; list changed files so a reviewer can
  // tell that apart from untested code.
  const dirtyFiles = git(['diff', '--name-only', 'HEAD']).stdout.split(/\r?\n/).filter(Boolean);

  return { sha, branch, dirty: dirtyFiles.length > 0, dirtyFiles };
}

// The first entry of `git worktree list` is the main checkout. Worktrees do not inherit
// gitignored files such as `.env.local`, so this is where to copy them from.
function mainCheckoutAppDir() {
  const list = git(['worktree', 'list', '--porcelain']);

  if (!list.ok) return null;

  const mainRoot = list.stdout.split(/\r?\n/)[0]?.replace(/^worktree /, '');
  const { repoRoot } = layout();

  if (!mainRoot || resolve(mainRoot) === resolve(repoRoot)) return null;

  return join(mainRoot, relative(repoRoot, APP_DIR));
}

function resolveBaseURL(values) {
  if (values.url) return values.url.replace(/\/$/, '');

  const state = readState();

  if (state && isAlive(state.pid)) return state.url;

  return null;
}

async function probe(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(60_000) });
    const html = await response.text();
    const meta = (name) =>
      html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`))?.[1] ?? null;

    return {
      ok: response.ok,
      status: response.status,
      catalyst: meta('platform') === 'bigcommerce.catalyst',
      channelId: meta('channel_id'),
    };
  } catch (error) {
    return { ok: false, status: 0, error: error.message };
  }
}

function loadPlaywright() {
  try {
    return requireFromApp('@playwright/test');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// doctor: read-only "is this instance worth driving?"

async function doctor(values) {
  const rows = [];
  const add = (level, check, detail) => rows.push({ level, check, detail });
  const { monorepo } = layout();
  const pkg = JSON.parse(readFileSync(join(APP_DIR, 'package.json'), 'utf8'));

  add(
    'PASS',
    'storefront',
    `${pkg.name}@${pkg.version} at ${APP_DIR} (${monorepo ? 'monorepo' : 'standalone project'})`,
  );

  const wantedNode = pkg.engines?.node?.match(/(\d+)/)?.[1];
  const haveNode = Number(process.versions.node.split('.')[0]);

  add(
    wantedNode && haveNode < Number(wantedNode) ? 'FAIL' : 'PASS',
    'node',
    `v${process.versions.node}${wantedNode ? ` (needs >=${wantedNode})` : ''}`,
  );

  add(
    existsSync(join(APP_DIR, 'node_modules', 'next')) ? 'PASS' : 'FAIL',
    'dependencies',
    existsSync(join(APP_DIR, 'node_modules', 'next')) ? 'installed' : 'run `pnpm install` first',
  );

  if (monorepo) {
    const clientDist = join(dirname(APP_DIR), 'packages', 'client', 'dist');

    add(
      existsSync(clientDist) ? 'PASS' : 'WARN',
      'catalyst-client build',
      existsSync(clientDist)
        ? 'packages/client/dist present'
        : '`launch` will build it (pnpm --filter @bigcommerce/catalyst-client build)',
    );
  }

  const envFile = join(APP_DIR, '.env.local');

  if (!existsSync(envFile)) {
    const main = mainCheckoutAppDir();
    const hint =
      main && existsSync(join(main, '.env.local'))
        ? `this is a git worktree; copy it from the main checkout: ${join(main, '.env.local')}`
        : 'create it from .env.example (or run `catalyst project link` / the Catalyst CLI)';

    add('FAIL', '.env.local', `missing — ${hint}`);
  } else {
    const env = { ...parseEnvFile(envFile), ...process.env };
    const missing = REQUIRED_ENV.filter((key) => !env[key]);

    add(
      missing.length ? 'FAIL' : 'PASS',
      '.env.local',
      missing.length ? `empty: ${missing.join(', ')}` : 'required keys set (values not shown)',
    );

    if (pkg.dependencies?.['@makeswift/runtime'] && !env.MAKESWIFT_SITE_API_KEY) {
      add('FAIL', 'makeswift', 'MAKESWIFT_SITE_API_KEY is empty (this storefront uses Makeswift)');
    }

    const testEnv = parseEnvFile(join(APP_DIR, '.env.test.local'));

    add(
      testEnv.TEST_CUSTOMER_EMAIL ? 'PASS' : 'WARN',
      'test customer',
      testEnv.TEST_CUSTOMER_EMAIL
        ? '.env.test.local has TEST_CUSTOMER_EMAIL'
        : 'no .env.test.local TEST_CUSTOMER_* — signed-in journeys unavailable',
    );
  }

  const playwright = loadPlaywright();

  if (!playwright) {
    add(
      'FAIL',
      'playwright',
      '@playwright/test not resolvable from the storefront — `pnpm add -D @playwright/test`',
    );
  } else {
    const exe = playwright.chromium.executablePath();

    add(
      existsSync(exe) ? 'PASS' : 'FAIL',
      'chromium',
      existsSync(exe)
        ? 'installed'
        : `missing — run \`npx playwright install chromium\`${process.platform === 'linux' ? ' (add --with-deps on a fresh Linux box)' : ''}`,
    );
  }

  add(
    has('ffmpeg') ? 'PASS' : 'WARN',
    'ffmpeg',
    has('ffmpeg') ? 'available (GIF/MP4 from video)' : `optional, for GIF/MP4: ${ffmpegHint()}`,
  );

  const gh = has('gh') ? ghVersion() : null;
  const ghAuthed = gh && run('gh', ['auth', 'status']).ok;
  const ghMin = GH_ATTACH_MIN.join('.');

  if (!gh) {
    add('WARN', 'gh', `not installed — install GitHub CLI ${ghMin}+ to upload evidence to PRs`);
  } else if (!supportsAttach(gh)) {
    add(
      'WARN',
      'gh',
      `${gh.join('.')} is too old for \`--attach\` — upgrade to ${ghMin}+ (${ghUpgradeHint()})`,
    );
  } else if (!ghAuthed) {
    add('WARN', 'gh', `${gh.join('.')} installed but not authenticated — run \`gh auth login\``);
  } else {
    add('PASS', 'gh', `${gh.join('.')} authenticated (publish uploads straight to the PR)`);
  }

  const state = readState();

  if (state) {
    const alive = isAlive(state.pid);

    add(
      alive ? 'PASS' : 'WARN',
      'launched server',
      alive
        ? `pid ${state.pid} on ${state.url} (${state.mode})`
        : `stale state for pid ${state.pid} — run \`stop\``,
    );
  }

  const url = resolveBaseURL(values);

  if (url) {
    const result = await probe(url);

    if (!result.ok)
      add('FAIL', 'target', `${url} not responding (${result.status || result.error})`);
    else if (!result.catalyst)
      add(
        'FAIL',
        'target',
        `${url} responded but is not a Catalyst storefront (no platform meta tag)`,
      );
    else add('PASS', 'target', `${url} is Catalyst (channel ${result.channelId ?? '?'})`);
  } else {
    add('WARN', 'target', 'no server — run `launch`, or pass --url for one you started yourself');
  }

  const width = Math.max(...rows.map((row) => row.check.length));

  for (const row of rows) {
    console.log(`${row.level.padEnd(4)}  ${row.check.padEnd(width)}  ${row.detail}`);
  }

  if (rows.some((row) => row.level === 'FAIL')) process.exitCode = 1;
}

function ghUpgradeHint() {
  if (process.platform === 'darwin') return '`brew upgrade gh`';
  if (IS_WINDOWS) return '`winget upgrade --id GitHub.cli`';

  return 'your package manager, or https://github.com/cli/cli/releases';
}

function ffmpegHint() {
  if (process.platform === 'darwin') return '`brew install ffmpeg`';
  if (IS_WINDOWS) return '`winget install Gyan.FFmpeg`';

  return '`sudo apt-get install ffmpeg` (or your distro equivalent)';
}

// ---------------------------------------------------------------------------------------------
// launch / stop

async function launch(values) {
  const existing = readState();

  if (existing && isAlive(existing.pid)) {
    console.log(
      `Already running: pid ${existing.pid} at ${existing.url} (run \`stop\` first to relaunch)`,
    );

    return;
  }

  if (!existsSync(join(APP_DIR, '.env.local')))
    fail('.env.local is missing — run `doctor` for the fix.');

  const port = Number(values.port ?? DEFAULT_PORT);

  if (!(await portIsFree(port))) {
    fail(
      `Port ${port} is in use. Pick another with --port, or drive the server already there with --url http://localhost:${port}.`,
    );
  }

  const { monorepo } = layout();

  if (monorepo && !existsSync(join(dirname(APP_DIR), 'packages', 'client', 'dist'))) {
    console.log('Building @bigcommerce/catalyst-client (monorepo only)…');

    const build = run('pnpm', ['--filter', '@bigcommerce/catalyst-client', 'build'], {
      cwd: dirname(APP_DIR),
      shim: true,
      stdio: 'inherit',
    });

    if (!build.ok) fail('catalyst-client build failed.');
  }

  mkdirSync(EVIDENCE_DIR, { recursive: true });

  const logFile = join(EVIDENCE_DIR, 'server.log');
  const node = process.execPath;
  const envArgs = ['--env-file-if-exists=.env.local'];

  if (existsSync(join(APP_DIR, 'scripts', 'generate.cjs'))) {
    console.log('Generating GraphQL types (scripts/generate.cjs)…');

    const generate = run(node, [...envArgs, 'scripts/generate.cjs'], { stdio: 'inherit' });

    if (!generate.ok)
      fail('GraphQL generation failed — check the store credentials in .env.local.');
  }

  const nextBin = requireFromApp.resolve('next/dist/bin/next');
  const mode = values.prod ? 'prod' : 'dev';

  if (mode === 'prod') {
    console.log('Building production bundle (next build)…');

    const build = run(node, [nextBin, 'build'], { stdio: 'inherit' });

    if (!build.ok) fail('next build failed.');
  }

  const out = openSync(logFile, 'w');
  const child = spawn(node, [nextBin, mode === 'prod' ? 'start' : 'dev', '--port', String(port)], {
    cwd: APP_DIR,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', out, out],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', PORT: String(port) },
  });

  child.unref();
  closeSync(out);

  const url = `http://localhost:${port}`;

  writeFileSync(
    STATE_FILE,
    JSON.stringify(
      { pid: child.pid, port, url, mode, logFile, startedAt: new Date().toISOString() },
      null,
      2,
    ),
  );

  console.log(`Started next ${mode} (pid ${child.pid}); log: ${logFile}`);
  console.log(
    `Waiting for ${url} to serve a Catalyst page (first dev compile can take a few minutes)…`,
  );

  const deadline = Date.now() + READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (!isAlive(child.pid)) {
      const tail = readFileSync(logFile, 'utf8').split(/\r?\n/).slice(-30).join('\n');

      rmSync(STATE_FILE, { force: true });
      fail(`Server exited during startup. Last log lines:\n${tail}`);
    }

    const result = await probe(url);

    if (result.ok && result.catalyst) {
      console.log(`\n✔ Ready: ${url} (channel ${result.channelId ?? '?'})`);

      return;
    }

    await new Promise((done) => setTimeout(done, 3000));
  }

  fail(`Timed out waiting for ${url}. Inspect ${logFile}, then run \`stop\`.`);
}

function killTree(pid) {
  if (IS_WINDOWS) {
    run('taskkill', ['/pid', String(pid), '/T', '/F']);

    return;
  }

  try {
    // `launch` starts the server as a process-group leader, so this reaches its children too.
    process.kill(-pid, 'SIGTERM');
  } catch {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // already gone
    }
  }
}

async function stop() {
  const state = readState();

  if (!state) {
    console.log(
      'Nothing to stop: no server was launched by this skill. (It never stops servers it did not start.)',
    );

    return;
  }

  if (isAlive(state.pid)) {
    killTree(state.pid);

    for (let i = 0; i < 20 && isAlive(state.pid); i++) {
      await new Promise((done) => setTimeout(done, 250));
    }

    if (isAlive(state.pid) && !IS_WINDOWS) process.kill(-state.pid, 'SIGKILL');
  }

  rmSync(STATE_FILE, { force: true });
  console.log(
    `Stopped pid ${state.pid} (${state.url}). Evidence in ${EVIDENCE_DIR} was left in place.`,
  );
}

// ---------------------------------------------------------------------------------------------
// Browser helpers shared by explore and capture

// Hide the Next.js dev-mode indicator so it does not appear in evidence.
const HIDE_DEV_OVERLAY = `
  addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = 'nextjs-portal { display: none !important; }';
    document.head.appendChild(style);
  });
`;

async function openBrowser(playwright, device, extra = {}) {
  const browser = await playwright.chromium.launch({ headless: !process.env.VERIFY_HEADED });
  const context = await browser.newContext({ ...VIEWPORTS[device], ...extra });

  await context.addInitScript(HIDE_DEV_OVERLAY);

  return { browser, context };
}

function requireBaseURL(values) {
  const url = resolveBaseURL(values);

  if (!url) fail('No target server. Run `launch` first, or pass --url.');

  return url;
}

// explore: print the ARIA snapshot of a page so stable handles can be chosen.
async function explore(values, positionals) {
  const playwright =
    loadPlaywright() ?? fail('@playwright/test is not installed in the storefront.');
  const baseURL = requireBaseURL(values);
  const device = values.device ?? 'desktop';
  const target = new URL(positionals[0] ?? '/', `${baseURL}/`).toString();
  const { browser, context } = await openBrowser(playwright, device);

  try {
    const page = await context.newPage();

    await page.goto(target, { waitUntil: 'networkidle', timeout: 120_000 }).catch(() => undefined);
    console.log(`# ${page.url()}  —  ${await page.title()}\n`);
    console.log(
      await page
        .locator(values.selector ?? 'body')
        .first()
        .ariaSnapshot(),
    );

    if (values.screenshot) {
      await page.screenshot({ path: values.screenshot, fullPage: true });
      console.log(`\nScreenshot: ${resolve(values.screenshot)}`);
    }
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------------------------
// capture: run a journey and keep the evidence

async function capture(values, positionals) {
  const journeyPath = positionals[0]
    ? resolve(positionals[0])
    : fail('Usage: capture <journey.mjs>');

  if (!existsSync(journeyPath)) fail(`Journey not found: ${journeyPath}`);

  const playwright =
    loadPlaywright() ?? fail('@playwright/test is not installed in the storefront.');
  const baseURL = requireBaseURL(values);
  const health = await probe(baseURL);

  if (!health.ok || !health.catalyst) fail(`${baseURL} is not serving Catalyst — run \`doctor\`.`);

  const journey = await import(pathToFileURL(journeyPath).href);
  const meta = journey.meta ?? {};
  const device = values.device ?? meta.device ?? 'desktop';

  if (!VIEWPORTS[device])
    fail(`Unknown device "${device}" (use ${Object.keys(VIEWPORTS).join(', ')}).`);

  const name = slugify(values.name ?? meta.name ?? basename(journeyPath, extname(journeyPath)));
  const label = values.label ? `-${slugify(values.label)}` : '';
  const runId = `${timestamp()}-${name}${label}-${device}`;
  const runDir = join(EVIDENCE_DIR, 'runs', runId);
  const videoTmp = join(runDir, '.video');

  mkdirSync(videoTmp, { recursive: true });
  copyFileSync(journeyPath, join(runDir, 'journey.mjs'));

  const { browser, context } = await openBrowser(playwright, device, {
    baseURL,
    recordVideo: { dir: videoTmp, size: VIEWPORTS[device].viewport },
  });

  await context.tracing.start({ screenshots: true, snapshots: true });

  const page = await context.newPage();
  // Recording starts on about:blank; note when the first page has loaded so the MP4 and GIF can
  // skip the blank lead-in (otherwise their first frame, GitHub's poster, is pure white).
  const recordingStarted = Date.now();
  let firstLoad = null;

  page.once('load', () => {
    firstLoad = Date.now();
  });

  const consoleErrors = [];
  const failedRequests = [];
  const steps = [];
  const origin = new URL(baseURL).origin;

  page.on(
    'console',
    (msg) => msg.type() === 'error' && consoleErrors.push(msg.text().slice(0, 500)),
  );
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message.slice(0, 500)}`));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(origin)) {
      failedRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  const step = async (stepLabel, action, opts = {}) => {
    const n = String(steps.length + 1).padStart(2, '0');
    const file = `${n}-${slugify(stepLabel)}.png`;
    const record = { n: steps.length + 1, label: stepLabel, status: 'passed', screenshot: file };

    steps.push(record);
    console.log(`  ${n}. ${stepLabel}`);

    try {
      if (action) await action();
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    } catch (error) {
      record.status = 'failed';
      record.error = error.message.split('\n').slice(0, 6).join('\n');
      record.screenshot = file.replace(/\.png$/, '-FAILED.png');
    } finally {
      record.url = page.url();
      await page
        .screenshot({ path: join(runDir, record.screenshot), fullPage: opts.fullPage === true })
        .catch(() => undefined);
    }

    if (record.status === 'failed') {
      const error = new Error(`Step "${stepLabel}" failed: ${record.error}`);

      error.stepFailure = true;
      throw error;
    }
  };

  const started = Date.now();
  let status = 'passed';
  let failure = null;

  console.log(`Capturing "${meta.title ?? name}" on ${baseURL} (${device})`);

  try {
    await journey.default({
      page,
      context,
      baseURL,
      step,
      expect: playwright.expect,
      env: { ...parseEnvFile(join(APP_DIR, '.env.test.local')) },
    });
  } catch (error) {
    status = 'failed';
    failure = error.stepFailure ? error.message : error.stack;
  }

  await context.tracing.stop({ path: join(runDir, 'trace.zip') });

  const video = page.video();

  await context.close();
  await browser.close();

  const files = [];

  if (video) {
    renameSync(await video.path(), join(runDir, 'video.webm'));
    files.push('video.webm');

    if (has('ffmpeg')) {
      const input = join(runDir, 'video.webm');
      const skip = firstLoad ? ((firstLoad - recordingStarted) / 1000).toFixed(2) : '0';
      const mp4 = run('ffmpeg', [
        '-y',
        '-loglevel',
        'error',
        '-i',
        input,
        '-ss',
        skip,
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        join(runDir, 'video.mp4'),
      ]);
      const gif = run('ffmpeg', [
        '-y',
        '-loglevel',
        'error',
        '-i',
        input,
        '-ss',
        skip,
        '-vf',
        // Fit inside 800×600 so portrait (mobile) recordings stay a reasonable size.
        'fps=8,scale=800:600:force_original_aspect_ratio=decrease:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse',
        join(runDir, 'video.gif'),
      ]);

      if (mp4.ok) files.push('video.mp4');
      if (gif.ok) files.push('video.gif');
    }
  }

  rmSync(videoTmp, { recursive: true, force: true });

  const manifest = {
    runId,
    title: meta.title ?? name,
    feature: meta.feature ?? null,
    label: values.label ?? null,
    status,
    failure,
    baseURL,
    device,
    viewport: VIEWPORTS[device].viewport,
    git: gitInfo(),
    platform: `${process.platform}-${process.arch}`,
    startedAt: new Date(started).toISOString(),
    durationMs: Date.now() - started,
    steps,
    consoleErrors,
    failedRequests,
    files: [...files, 'trace.zip', 'journey.mjs'],
  };

  writeFileSync(join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  writeFileSync(
    join(runDir, 'summary.md'),
    renderMarkdown(manifest, (file) => file),
  );

  console.log(
    `\n${status === 'passed' ? '✔' : '✖'} ${status.toUpperCase()} — evidence in ${runDir}`,
  );
  if (failure) console.log(`\n${failure}`);
  if (consoleErrors.length)
    console.log(`\n⚠ ${consoleErrors.length} console error(s) recorded in manifest.json`);
  if (status !== 'passed') process.exitCode = 1;
}

// Display widths for the PR. GitHub scales images to the comment column (~880px), which blows a
// portrait (mobile) capture up to several screens tall, so size by orientation instead.
const DISPLAY = {
  landscape: { recording: 720, screenshot: 720 },
  portrait: { recording: 280, screenshot: 180 },
};

function img(src, alt, width) {
  return `<img src="${src}" alt="${alt.replace(/"/g, '&quot;')}" width="${width}">`;
}

function renderMarkdown(manifest, urlFor, { attach = false } = {}) {
  const lines = [];
  const icon = manifest.status === 'passed' ? '✅' : '❌';
  const sha = manifest.git.sha ? manifest.git.sha.slice(0, 10) : 'unknown';
  const { width, height } = manifest.viewport;
  const portrait = height > width;
  const size = DISPLAY[portrait ? 'portrait' : 'landscape'];

  const tags = [manifest.device, manifest.label].filter(Boolean).join(', ');
  const dirtyFiles = manifest.git.dirtyFiles ?? [];
  const dirtyNote = dirtyFiles.length
    ? ` + uncommitted changes to ${dirtyFiles
        .slice(0, 3)
        .map((file) => `\`${file}\``)
        .join(', ')}${dirtyFiles.length > 3 ? ` and ${dirtyFiles.length - 3} more` : ''}`
    : '';

  lines.push(`### ${icon} ${manifest.title} (${tags})`);
  lines.push('');
  lines.push(
    `\`${sha}\`${dirtyNote} · ${manifest.device} ${width}×${height} · ${manifest.platform} · ${(manifest.durationMs / 1000).toFixed(1)}s`,
  );
  lines.push('');

  if (manifest.failure) lines.push('```', manifest.failure, '```', '');

  const videoFile = manifest.files.includes('video.mp4') ? 'video.mp4' : 'video.webm';

  if (attach) {
    // A bare attachment URL on its own line renders as GitHub's video player.
    if (manifest.files.includes(videoFile)) lines.push(urlFor(videoFile), '');
  } else {
    if (manifest.files.includes('video.gif')) {
      lines.push(img(urlFor('video.gif'), 'Recording', size.recording), '');
    }

    if (manifest.files.includes(videoFile)) {
      lines.push(
        `🎥 [Full recording (${videoFile.split('.')[1]})](${urlFor(videoFile)}) · 🔍 [Playwright trace](${urlFor('trace.zip')}) (\`npx playwright show-trace trace.zip\`)`,
        '',
      );
    }
  }

  lines.push('| # | Step | Result |', '|---|---|---|');

  for (const s of manifest.steps) {
    lines.push(
      `| ${s.n} | ${s.label} | ${s.status === 'passed' ? '✅' : `❌ ${s.error?.split('\n')[0] ?? ''}`} |`,
    );
  }

  lines.push('');
  lines.push('<details><summary>Screenshots</summary>', '');

  if (portrait) {
    // Narrow captures read best side by side, as a filmstrip.
    lines.push(
      `| ${manifest.steps.map((s) => `${s.n}. ${s.label}`).join(' | ')} |`,
      `|${manifest.steps.map(() => '---').join('|')}|`,
      `| ${manifest.steps.map((s) => img(urlFor(s.screenshot), s.label, size.screenshot)).join(' | ')} |`,
      '',
    );
  } else {
    for (const s of manifest.steps) {
      lines.push(
        `**${s.n}. ${s.label}**`,
        '',
        img(urlFor(s.screenshot), s.label, size.screenshot),
        '',
      );
    }
  }

  lines.push('</details>', '');

  if (manifest.consoleErrors.length || manifest.failedRequests.length) {
    lines.push('<details><summary>Console errors / failed requests</summary>', '', '```');
    lines.push(...manifest.consoleErrors, ...manifest.failedRequests);
    lines.push('```', '</details>', '');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------------------------
// publish: upload a run's evidence and write PR-ready markdown

// `gh` 2.99.0 added `--attach` to `gh pr create|edit|comment`, which uploads images and videos as
// native GitHub attachments: videos play inline and access follows the repository. GitHub only
// accepts attachments from accounts with write access to the repository, so contributors
// opening a PR from a fork upload elsewhere and post the markdown instead.
const GH_ATTACH_MIN = [2, 99, 0];
const ATTACH_LIMIT = 50;
const EVIDENCE_MARKER = '<!-- verification-evidence -->';
const UPLOAD_START = '<!-- verify-catalyst:uploading -->';
const UPLOAD_END = '<!-- /verify-catalyst:uploading -->';

function ghVersion() {
  const match = run('gh', ['--version']).stdout.match(/gh version (\d+)\.(\d+)\.(\d+)/);

  return match ? match.slice(1, 4).map(Number) : null;
}

function supportsAttach(version) {
  if (!version) return false;

  for (let i = 0; i < 3; i++) {
    if (version[i] !== GH_ATTACH_MIN[i]) return version[i] > GH_ATTACH_MIN[i];
  }

  return true;
}

function resolvePr(values) {
  const view = run('gh', [
    'pr',
    'view',
    ...(values.pr ? [values.pr] : []),
    '--json',
    'url',
    '--jq',
    '.url',
  ]);

  return view.ok ? view.stdout : (values.pr ?? null);
}

function prRepo(prUrl) {
  const match = prUrl?.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/\d+/);

  return match ? { owner: match[1], repo: match[2] } : null;
}

function repoAccess({ owner, repo }) {
  const view = run('gh', [
    'repo',
    'view',
    `${owner}/${repo}`,
    '--json',
    'visibility,viewerPermission',
  ]);

  return view.ok ? JSON.parse(view.stdout) : {};
}

function githubSlug(remote) {
  const url = git(['remote', 'get-url', remote]).stdout;
  const match = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);

  return match ? { owner: match[1], repo: match[2] } : null;
}

function latestRunDir() {
  const runsDir = join(EVIDENCE_DIR, 'runs');

  if (!existsSync(runsDir)) return null;

  const runs = readdirSync(runsDir)
    .map((entry) => join(runsDir, entry))
    .filter((entry) => statSync(entry).isDirectory())
    .sort();

  return runs.at(-1) ?? null;
}

// Media for the PR. The MP4 supersedes the WebM (and the GIF, where video plays inline).
function mediaFiles(manifest, { inlineVideo }) {
  const files = [];
  const video = ['video.mp4', 'video.webm'].find((file) => manifest.files.includes(file));

  if (video) files.push(video);
  if (!inlineVideo && manifest.files.includes('video.gif')) files.push('video.gif');

  return [...files, ...manifest.steps.map((s) => s.screenshot)];
}

function uploadToBranch(runs, remote) {
  const slug = githubSlug(remote) ?? fail(`Remote "${remote}" is not a GitHub remote.`);
  const branch = `verification-evidence/${slugify(runs[0].manifest.git.branch || 'detached')}`;
  const index = join(mkdtempSync(join(tmpdir(), 'verify-index-')), 'index');
  const env = { ...process.env, GIT_INDEX_FILE: index };
  const fetched = git(['fetch', '--quiet', remote, `refs/heads/${branch}`]);
  const parent = fetched.ok ? git(['rev-parse', 'FETCH_HEAD']).stdout : null;

  git(parent ? ['read-tree', parent] : ['read-tree', '--empty'], { env });

  for (const r of runs) {
    for (const file of [...mediaFiles(r.manifest, { inlineVideo: false }), 'trace.zip']) {
      if (!existsSync(join(r.dir, file))) continue;

      const blob = git(['hash-object', '-w', join(r.dir, file)]).stdout;

      git(['update-index', '--add', '--cacheinfo', `100644,${blob},${r.manifest.runId}/${file}`], {
        env,
      });
    }
  }

  const tree = git(['write-tree'], { env }).stdout;
  const commit = git(
    ['commit-tree', tree, ...(parent ? ['-p', parent] : []), '-m', 'verification evidence'],
    { env },
  );

  rmSync(dirname(index), { recursive: true, force: true });

  if (!commit.ok) fail(`git commit-tree failed: ${commit.stderr}`);

  const push = git(['push', '--quiet', remote, `${commit.stdout}:refs/heads/${branch}`]);

  if (!push.ok) fail(`Pushing ${branch} to ${remote} failed: ${push.stderr}`);

  console.log(
    `Uploaded evidence to ${remote}/${branch} (outside the PR branch; the diff is untouched).`,
  );

  return (r) => (file) =>
    `https://github.com/${slug.owner}/${slug.repo}/raw/${commit.stdout}/${r.manifest.runId}/${file}`;
}

function uploadToGist(runs) {
  const login =
    run('gh', ['api', 'user', '--jq', '.login']).stdout || fail('`gh` is not authenticated.');
  const tmp = mkdtempSync(join(tmpdir(), 'verify-gist-'));
  const readme = join(tmp, '00-verification.md');
  const title = runs.map((r) => r.manifest.runId).join(', ');

  writeFileSync(readme, `Catalyst verification evidence: ${title}\n`);

  const created = run('gh', [
    'gist',
    'create',
    readme,
    '--desc',
    `Catalyst verification: ${title}`,
  ]);
  const id = created.stdout.match(/gist\.github\.com\/(?:[^/]+\/)?([0-9a-f]+)/)?.[1];

  if (!created.ok || !id) fail(`gh gist create failed: ${created.stderr}`);

  // Gists are flat git repositories; binaries cannot go through `gh gist create`, but they can be
  // pushed. Prefix each file with its device so runs do not collide.
  const clone = join(tmp, 'gist');
  const cloned = git(['clone', '--quiet', `https://gist.github.com/${id}.git`, clone]);

  if (!cloned.ok) fail(`Cloning the gist failed (try \`gh auth setup-git\`): ${cloned.stderr}`);

  const name = (r, file) =>
    `${r.manifest.device}${r.manifest.label ? `-${r.manifest.label}` : ''}-${file}`;

  for (const r of runs) {
    for (const file of [...mediaFiles(r.manifest, { inlineVideo: false }), 'trace.zip']) {
      if (existsSync(join(r.dir, file)))
        copyFileSync(join(r.dir, file), join(clone, name(r, file)));
    }
  }

  git(['add', '.'], { cwd: clone });
  git(['commit', '--quiet', '-m', 'verification evidence'], { cwd: clone });

  const push = git(['push', '--quiet'], { cwd: clone });

  if (!push.ok) fail(`Pushing to the gist failed (try \`gh auth setup-git\`): ${push.stderr}`);

  const sha = git(['rev-parse', 'HEAD'], { cwd: clone }).stdout;

  rmSync(tmp, { recursive: true, force: true });
  console.log(`Uploaded evidence to secret gist https://gist.github.com/${login}/${id}`);

  return (r) => (file) =>
    `https://gist.githubusercontent.com/${login}/${id}/raw/${sha}/${name(r, file)}`;
}

function chooseDestination(values, prUrl) {
  const remote = values.remote ?? 'origin';
  const version = has('gh') ? ghVersion() : null;
  const authed = version && run('gh', ['auth', 'status']).ok;

  if (!authed) {
    console.log(
      `gh ${GH_ATTACH_MIN.join('.')}+ is not installed and signed in, so evidence cannot be uploaded from the CLI.`,
    );

    return 'manual';
  }

  const target = prRepo(prUrl) ?? githubSlug(remote);
  const access = target ? repoAccess(target) : {};
  const canWrite = ['ADMIN', 'MAINTAIN', 'WRITE'].includes(access.viewerPermission);

  if (canWrite && supportsAttach(version)) return 'attach';

  if (!supportsAttach(version)) {
    console.log(
      `gh ${version.join('.')} predates --attach; upgrade to ${GH_ATTACH_MIN.join('.')}+ (${ghUpgradeHint()}) to upload straight to the PR.`,
    );
  } else {
    console.log(
      `No write access to ${target.owner}/${target.repo} (a fork contribution?), and GitHub only takes --attach uploads from writers.`,
    );
  }

  // Secret gists are unlisted but readable by anyone with the link, so they are only used when
  // GitHub confirms the repository is public. A private repository's evidence goes to a branch,
  // where GitHub's access control applies. If the visibility lookup failed, fail closed: do not
  // guess, and leave the upload to the user (or an explicit `--to gist`).
  if (access.visibility === 'PUBLIC') return 'gist';
  if (access.visibility) return 'branch';

  console.log(
    `Could not read the visibility of ${target ? `${target.owner}/${target.repo}` : 'the repository'}, so evidence is not uploaded automatically. Pass --to gist if you know it is public.`,
  );

  return 'manual';
}

function publish(values, positionals) {
  const dirs = positionals.length ? positionals.map((p) => resolve(p)) : [latestRunDir()];
  const runs = dirs.map((dir) => {
    if (!dir || !existsSync(join(dir, 'manifest.json'))) {
      fail(`No run at ${dir ?? EVIDENCE_DIR} — run \`capture\` first.`);
    }

    return { dir, manifest: JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')) };
  });
  const cwd = dirname(runs[0].dir);

  if (runs.some((r) => dirname(r.dir) !== cwd)) fail('Publish runs from the same directory.');

  const pr = resolvePr(values);
  let to = values.to ?? 'auto';

  if (to === 'auto') {
    to = chooseDestination(values, pr);
    console.log(`--to auto → ${to}`);
  }

  const attach = to === 'attach';
  const local = (r) => (file) => `./${basename(r.dir)}/${file}`;
  const urlsFor =
    to === 'gist'
      ? uploadToGist(runs)
      : to === 'branch'
        ? uploadToBranch(runs, values.remote ?? 'origin')
        : local;
  const render = (urlFor) =>
    runs
      .map((r) => renderMarkdown(r.manifest, urlFor(r), { attach }))
      .join('\n')
      .concat(
        attach
          ? '\n<sub>Recorded with the verify-catalyst skill. Playwright traces stay local: `npx playwright show-trace <run>/trace.zip`.</sub>\n'
          : '\n<sub>Recorded with the verify-catalyst skill.</sub>\n',
      );
  // `gh --attach` only rewrites markdown references (`![alt](./path)`), not sized `<img>` tags.
  // So attach mode posts plain references first, then rewrites them into the final layout.
  const refs = attach
    ? runs.flatMap((r) =>
        mediaFiles(r.manifest, { inlineVideo: true }).map((file) => local(r)(file)),
      )
    : [];
  const evidence = attach
    ? `${UPLOAD_START}\n\n${refs.map((ref) => `![${ref}](${ref})`).join('\n\n')}\n\n${UPLOAD_END}`
    : render(urlsFor);
  const bodyFile = join(cwd, `pr-evidence-${timestamp()}.md`);

  if (to === 'manual') {
    writeFileSync(bodyFile, evidence);
    console.log(
      `Drag the MP4s and screenshots from\n  ${runs.map((r) => r.dir).join('\n  ')}\ninto a comment on the PR at github.com (GitHub hosts them and plays MP4 inline).\nA text skeleton is in ${bodyFile}.`,
    );

    return;
  }

  const into = values.into ?? 'comment';
  let args;

  if (into === 'body') {
    const current = pr ? run('gh', ['pr', 'view', pr, '--json', 'body', '--jq', '.body']) : null;
    const body = current?.ok ? current.stdout : '';

    writeFileSync(
      bodyFile,
      body.includes(EVIDENCE_MARKER)
        ? body.replace(EVIDENCE_MARKER, `\n\n${evidence}\n`)
        : `${body}\n\n## Verification evidence\n\n${evidence}`,
    );
    args = ['pr', 'edit', pr ?? '<pr>', '--body-file', bodyFile];
  } else {
    writeFileSync(bodyFile, evidence);
    args = ['pr', 'comment', pr ?? '<pr>', '--body-file', bodyFile];
  }

  if (attach) {
    if (refs.length > ATTACH_LIMIT) {
      fail(
        `${refs.length} files exceed gh's ${ATTACH_LIMIT}-attachment limit; publish fewer runs at once.`,
      );
    }

    for (const file of refs) args.push('--attach', file);
  }

  const printable = `gh ${args.map((a) => (/[\s<>]/.test(a) ? `"${a}"` : a)).join(' ')}`;

  if (!pr || values['dry-run']) {
    if (!pr) console.log('No pull request found for this branch; pass --pr <number|url>.');
    console.log(`Evidence markdown: ${bodyFile}\nFrom ${cwd}, run:\n  ${printable}`);

    return;
  }

  const result = run('gh', args, { cwd });

  if (!result.ok) {
    fail(
      `gh ${args[0]} ${args[1]} failed: ${result.stderr || result.stdout}\nFrom ${cwd}, retry with:\n  ${printable}`,
    );
  }

  if (attach) layOutAttachments({ pr, into, posted: result.stdout, refs, render, local, bodyFile });

  console.log(
    `Posted evidence to ${into === 'body' ? 'the body of' : 'a comment on'} ${pr}\n${result.stdout}`,
  );
}

// Second pass of attach mode: read back the URLs `gh` uploaded (in reference order) and replace
// the plain references with the sized layout. Editing text needs no attachment rights.
function layOutAttachments({ pr, into, posted, refs, render, local, bodyFile }) {
  const repo = prRepo(pr);
  const commentId = posted.match(/#issuecomment-(\d+)/)?.[1];
  const read =
    into === 'body'
      ? run('gh', ['pr', 'view', pr, '--json', 'body', '--jq', '.body'])
      : run('gh', [
          'api',
          `repos/${repo.owner}/${repo.repo}/issues/comments/${commentId}`,
          '--jq',
          '.body',
        ]);
  const text = read.stdout;
  const start = text.indexOf(UPLOAD_START);
  const end = text.indexOf(UPLOAD_END);
  const warn = (why) =>
    console.log(`⚠ Uploaded, but ${why}; the PR shows unsized images. Edit it by hand if needed.`);

  if (!read.ok || start < 0 || end < 0) return warn('could not read the post back');

  // Images keep their `![alt](url)` form; a video becomes a bare URL on its own line.
  const urls = [
    ...text.slice(start, end).matchAll(/!\[[^\]]*\]\((https:\/\/[^)\s]+)\)|^(https:\/\/\S+)$/gm),
  ].map((m) => m[1] ?? m[2]);

  if (urls.length !== refs.length) return warn(`found ${urls.length} of ${refs.length} uploads`);

  const uploaded = new Map(refs.map((ref, i) => [ref, urls[i]]));
  const final = render((r) => (file) => uploaded.get(local(r)(file)) ?? local(r)(file));

  writeFileSync(bodyFile, `${text.slice(0, start)}${final}${text.slice(end + UPLOAD_END.length)}`);

  const update =
    into === 'body'
      ? run('gh', ['pr', 'edit', pr, '--body-file', bodyFile])
      : run('gh', [
          'api',
          '-X',
          'PATCH',
          `repos/${repo.owner}/${repo.repo}/issues/comments/${commentId}`,
          '-F',
          `body=@${bodyFile}`,
        ]);

  if (!update.ok) warn(`the layout edit failed (${update.stderr})`);
}

// ---------------------------------------------------------------------------------------------

const HELP = `Usage: node <skill>/scripts/verify.mjs <command> [options]

  doctor   [--url URL]                       Read-only health check of tools, env, and the target
  launch   [--port ${DEFAULT_PORT}] [--prod]            Start a storefront for verification and wait until it is ready
  stop                                       Stop the server started by \`launch\` (never anything else)
  explore  [path] [--selector css] [--device d] [--screenshot file]
                                             Print the ARIA snapshot of a page to find stable handles
  capture  <journey.mjs> [--device desktop|tablet|mobile] [--label before|after] [--name slug] [--url URL]
                                             Run a journey; record video, screenshots, and a trace
  publish  [run-dir ...] [--pr <number|url>] [--into comment|body] [--dry-run]
           [--to auto|attach|gist|branch|manual] [--remote origin]
                                             Upload runs to the pull request (gh 2.99.0+ --attach)

  --url defaults to the server started by \`launch\`. Evidence lives in ${relative(process.cwd(), EVIDENCE_DIR) || '.verification'}/runs/.
  Set VERIFY_HEADED=1 to watch the browser.`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    url: { type: 'string' },
    port: { type: 'string' },
    prod: { type: 'boolean' },
    device: { type: 'string' },
    label: { type: 'string' },
    name: { type: 'string' },
    selector: { type: 'string' },
    screenshot: { type: 'string' },
    to: { type: 'string' },
    remote: { type: 'string' },
    pr: { type: 'string' },
    into: { type: 'string' },
    'dry-run': { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
  },
});

const [command, ...rest] = positionals;
const commands = { doctor, launch, stop, explore, capture, publish };

if (!command || values.help || !commands[command]) {
  console.log(HELP);
  process.exit(command && !values.help ? 1 : 0);
}

await commands[command](values, rest);
