// Exercises catalyst-preview.mjs against a stubbed BigCommerce + GitHub API.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRATCH = mkdtempSync(join(tmpdir(), 'catalyst-preview-'));
const STUB = join(HERE, 'stub.mjs');
const SCRIPT = join(HERE, '..', 'scripts', 'catalyst-preview.mjs');

const UUID = 'e484675f-4a4b-11f1-9409-8a648dbfa924';
const MARKER = '<!-- catalyst-preview -->';
const deployed = (url) => `${MARKER}\n**Preview deployed** → ${url}\n\n[build log]()\n`;

let failures = 0;

function run(name, opts, assert) {
  const {
    cmd, pr, pulls = [pr], comments = {}, projects = [], takeover = false,
    env = {}, uuid = UUID, bcStatus = null, ghStatus = null,
  } = opts;

  const statePath = `${SCRATCH}/state.json`;
  const outPath = `${SCRATCH}/out.txt`;
  writeFileSync(statePath, JSON.stringify({ pulls, comments, projects, calls: [], bcStatus, ghStatus }, null, 2));
  writeFileSync(outPath, '');

  const res = spawnSync('node', ['--import', STUB, SCRIPT, cmd], {
    encoding: 'utf8',
    env: {
      ...process.env,
      FAKE_STATE: statePath,
      GITHUB_OUTPUT: outPath,
      CATALYST_STORE_HASH: 'kyfkff1nsa',
      CATALYST_ACCESS_TOKEN: 'token',
      PREVIEW_DEPLOYMENT_PROJECT_UUID: uuid,
      GITHUB_TOKEN: 'gh-token',
      GITHUB_REPOSITORY: 'jordanarldt/catalyst-native-hosting-test',
      PR_NUMBER: String(pr),
      IS_TAKEOVER: takeover ? 'true' : 'false',
      ...env,
    },
  });

  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const outputs = Object.fromEntries(
    readFileSync(outPath, 'utf8').trim().split('\n').filter(Boolean)
      .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
  );

  const ctx = {
    exit: res.status,
    stderr: res.stderr,
    outputs,
    comments: state.comments,
    calls: state.calls.map((c) => `${c.op}#${c.pr}`),
  };

  try { assert(ctx); console.log(`  PASS  ${name}`); }
  catch (e) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${e.message}`);
    console.log('        ' + JSON.stringify(ctx, null, 2).replace(/\n/g, '\n        '));
  }
}

const eq = (a, b, what) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
};
const has = (s, sub, what) => {
  if (!String(s).includes(sub)) throw new Error(`${what}: expected to contain "${sub}", got ${JSON.stringify(s)}`);
};

console.log('\ncatalyst-preview.mjs (shared project)');

// ---- check ----
run('newest open PR deploys automatically',
  { cmd: 'check', pr: 5, pulls: [3, 5] },
  (c) => { eq(c.exit, 0, 'exit'); eq(c.outputs.should_deploy, 'true', 'should_deploy'); eq(c.outputs.reason, 'newest', 'reason'); });

run('older PR does not deploy on push',
  { cmd: 'check', pr: 3, pulls: [3, 5] },
  (c) => { eq(c.exit, 0, 'exit'); eq(c.outputs.should_deploy, 'false', 'should_deploy'); eq(c.outputs.reason, 'not-newest', 'reason'); eq(c.outputs.newest_pr, '5', 'newest_pr'); });

run('older PR deploys when it is the takeover command',
  { cmd: 'check', pr: 3, pulls: [3, 5], takeover: true },
  (c) => { eq(c.exit, 0, 'exit'); eq(c.outputs.should_deploy, 'true', 'should_deploy'); eq(c.outputs.reason, 'takeover', 'reason'); });

run('a lone PR is the newest',
  { cmd: 'check', pr: 7, pulls: [7] },
  (c) => { eq(c.outputs.should_deploy, 'true', 'should_deploy'); });

run('rejects a project uuid that is not a uuid',
  { cmd: 'check', pr: 5, uuid: 'project-preview' },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, 'not a UUID', 'stderr'); });

run('auto-deploy-newest=false requires the command even on the newest PR',
  { cmd: 'check', pr: 5, pulls: [3, 5], env: { AUTO_DEPLOY_NEWEST: 'false' } },
  (c) => { eq(c.exit, 0, 'exit'); eq(c.outputs.should_deploy, 'false', 'should_deploy'); eq(c.outputs.reason, 'manual-only', 'reason'); });

run('auto-deploy-newest=false still lets the command through',
  { cmd: 'check', pr: 3, pulls: [3, 5], takeover: true, env: { AUTO_DEPLOY_NEWEST: 'false' } },
  (c) => { eq(c.outputs.should_deploy, 'true', 'should_deploy'); eq(c.outputs.reason, 'takeover', 'reason'); });

// ---- hostname ----
run('hostname resolves the configured project',
  { cmd: 'hostname', pr: 5, projects: [
      { uuid: 'other-1111-1111-1111-111111111111', name: 'prod', deployment_hostnames: ['shop.example.com'] },
      { uuid: UUID, name: 'catalyst-preview', deployment_hostnames: ['preview.example.store'] },
    ] },
  (c) => { eq(c.exit, 0, 'exit'); eq(c.outputs.url, 'https://preview.example.store', 'url'); eq(c.outputs.project_name, 'catalyst-preview', 'project_name'); });

run('hostname fails clearly when the uuid is not on the store',
  { cmd: 'hostname', pr: 5, projects: [{ uuid: 'other-1111-1111-1111-111111111111', name: 'prod', deployment_hostnames: ['x'] }] },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, 'No hosting project with UUID', 'stderr'); });

// ---- announce ----
run('announce posts on this PR and notifies the displaced one',
  { cmd: 'announce', pr: 3, pulls: [3, 5],
    comments: { 5: [{ id: 1, body: deployed('https://preview.example.store') }] },
    env: { PREVIEW_URL: 'https://preview.example.store', COMMIT: 'abcdef1234', RUN_URL: 'https://run' } },
  (c) => {
    eq(c.exit, 0, 'exit');
    has(c.comments[3][0].body, '**Preview deployed**', 'own comment');
    has(c.comments[3][0].body, 'Commit `abcdef1', 'commit shown');
    // The displaced PR was advertising a live preview, so it is deleted and
    // reposted rather than edited, to actually notify.
    eq(c.calls.filter((x) => x.endsWith('#5')), ['delete#5', 'create#5'], 'displaced PR notified');
    has(c.comments[5][0].body, '**Preview replaced**', 'displaced body');
    has(c.comments[5][0].body, 'now serves #3', 'names the new owner');
  });

run('announce leaves an already-correct notice untouched',
  { cmd: 'announce', pr: 3, pulls: [3, 5],
    comments: {
      3: [{ id: 1, body: deployed('https://preview.example.store') }],
      5: [{ id: 2, body: `${MARKER}\n**Preview replaced** — the shared preview now serves #3, so the URL above no longer reflects this pull request.\n\nComment \`redeploy preview\` here to point it back at these changes.\n` }],
    },
    env: { PREVIEW_URL: 'https://preview.example.store', RUN_URL: 'https://run' } },
  (c) => {
    eq(c.exit, 0, 'exit');
    // Repeated pushes to #3 must not re-notify #5 every time.
    eq(c.calls.filter((x) => x.endsWith('#5')), [], 'no churn on #5');
  });

run('announce quietly refreshes a deferral notice on another PR',
  { cmd: 'announce', pr: 5, pulls: [3, 5],
    comments: { 3: [{ id: 2, body: `${MARKER}\n**Preview not deployed** — the shared preview is reserved for the newest pull request (#5).\n` }] },
    env: { PREVIEW_URL: 'https://preview.example.store', RUN_URL: 'https://run' } },
  (c) => {
    eq(c.exit, 0, 'exit');
    eq(c.calls.filter((x) => x.endsWith('#3')), ['patch#3'], 'edited in place, no notification');
    has(c.comments[3][0].body, '**Preview replaced**', 'body updated');
  });

run('announce ignores closed PRs entirely',
  { cmd: 'announce', pr: 5, pulls: [5],
    comments: { 3: [{ id: 2, body: deployed('https://preview.example.store') }] },
    env: { PREVIEW_URL: 'https://preview.example.store', RUN_URL: 'https://run' } },
  (c) => { eq(c.exit, 0, 'exit'); eq(c.calls.filter((x) => x.endsWith('#3')), [], 'closed PR untouched'); });

run('announce omits the commit when it is unavailable',
  { cmd: 'announce', pr: 5, pulls: [5],
    env: { PREVIEW_URL: 'https://preview.example.store', RUN_URL: 'https://run' } },
  (c) => {
    const body = c.comments[5][0].body;
    if (body.includes('``')) throw new Error('rendered empty backticks: ' + JSON.stringify(body));
    has(body, '[build log](https://run)', 'build log');
  });

// ---- defer ----
run('defer creates a notice when none exists',
  { cmd: 'defer', pr: 3, pulls: [3, 5], env: { NEWEST_PR: '5' } },
  (c) => {
    eq(c.exit, 0, 'exit');
    eq(c.calls, ['create#3'], 'calls');
    has(c.comments[3][0].body, 'reserved for the newest pull request (#5)', 'body');
    has(c.comments[3][0].body, 'redeploy preview', 'tells you how to take it');
  });

run('defer edits in place and stays silent on repeat pushes',
  { cmd: 'defer', pr: 3, pulls: [3, 5],
    comments: { 3: [{ id: 1, body: deployed('https://old.example.store') }] },
    env: { NEWEST_PR: '5' } },
  (c) => { eq(c.calls, ['patch#3'], 'patched, not reposted'); });

run('defer is a no-op when the notice is already correct',
  { cmd: 'defer', pr: 3, pulls: [3, 5],
    comments: { 3: [{ id: 1, body: `${MARKER}\n**Preview not deployed** — the shared preview is reserved for the newest pull request (#5).\n\nComment \`redeploy preview\` here to point it at these changes instead.\n` }] },
    env: { NEWEST_PR: '5' } },
  (c) => { eq(c.calls, [], 'no API writes'); });

// ---- failure messages ----
run('rejects a PR number that is not a number',
  { cmd: 'check', pr: 5, env: { PR_NUMBER: 'not-a-number' } },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, 'PR_NUMBER must be a positive integer', 'stderr'); });

run('explains a 403 from the infrastructure API',
  { cmd: 'hostname', pr: 5, bcStatus: 403 },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, 'store_infrastructure_projects_manage', 'names the scope'); });

run('surfaces an unexpected BigCommerce error',
  { cmd: 'hostname', pr: 5, bcStatus: 500 },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, '500', 'includes the status'); });

run('surfaces an unexpected GitHub error',
  { cmd: 'check', pr: 5, ghStatus: 500 },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, '500', 'includes the status'); });

run('reports a project that has no hostname yet',
  { cmd: 'hostname', pr: 5, projects: [{ uuid: UUID, name: 'catalyst-preview', deployment_hostnames: [] }] },
  (c) => { eq(c.exit, 1, 'exit'); has(c.stderr, 'no deployment hostname yet', 'stderr'); });

console.log(failures ? `\n${failures} failing\n` : '\nall passing\n');
process.exit(failures ? 1 : 0);
