// Nothing compiles action.yml, so a YAML or shell mistake would only surface in
// a consumer's repository. Parse it here, and syntax-check every run block.
import { spawnSync } from 'node:child_process';
import fs, { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

import yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = join(ROOT, '..', '..');

let failures = 0;

const check = (name, fn) => {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failures++;
    console.log(`  FAIL  ${name}\n        ${error.message}`);
  }
};

const load = (path) => yaml.load(readFileSync(path, 'utf8'));

console.log('\naction.yml');

const action = load(join(ROOT, 'action.yml'));
const reusable = join(REPO_ROOT, '.github', 'workflows', 'deployment-preview.yml');

check('action.yml is a composite action', () => {
  if (action.runs.using !== 'composite') throw new Error(`using is "${action.runs.using}"`);
});

check('every run step declares a shell', () => {
  const missing = action.runs.steps.filter((s) => s.run && !s.shell).map((s) => s.name);
  if (missing.length) throw new Error(`missing shell: ${missing.join(', ')}`);
});

check('every run block is valid bash', () => {
  const script = join(tmpdir(), 'catalyst-preview-step.sh');
  const broken = [];

  for (const step of action.runs.steps) {
    if (!step.run) continue;
    writeFileSync(script, step.run);
    const result = spawnSync('bash', ['-n', script], { encoding: 'utf8' });

    // Nothing to check against on a machine without bash. Say so rather than
    // reading result.stderr, which is null when the spawn itself failed.
    if (result.error) {
      console.log(`  SKIP  every run block is valid bash (no bash: ${result.error.code})`);

      return;
    }

    if (result.status !== 0) broken.push(`${step.name}: ${result.stderr.trim()}`);
  }

  if (broken.length) throw new Error(broken.join('\n        '));
});

check('configuration resolves from inputs or conventional env vars', () => {
  const resolve = action.runs.steps.find((s) => s.name === 'Resolve configuration');
  if (!resolve) throw new Error('no "Resolve configuration" step');

  // Every credential must have both an input path and an env fallback.
  const expected = [
    ['inputs.project-uuid', 'BIGCOMMERCE_PREVIEW_PROJECT_UUID'],
    ['inputs.store-hash', 'BIGCOMMERCE_STORE_HASH'],
    ['inputs.access-token', 'BIGCOMMERCE_ACCESS_TOKEN'],
    ['inputs.storefront-token', 'BIGCOMMERCE_STOREFRONT_TOKEN'],
    ['inputs.channel-id', 'BIGCOMMERCE_CHANNEL_ID'],
    ['inputs.auth-secret', 'AUTH_SECRET'],
  ];
  const wired = JSON.stringify(resolve.env || {}) + resolve.run;
  const missing = expected.filter(([i, e]) => !wired.includes(i) || !wired.includes(e));

  if (missing.length) throw new Error(`not resolvable: ${missing.map(([i]) => i).join(', ')}`);
});

check('credentials arriving as plain env vars are masked', () => {
  const resolve = action.runs.steps.find((s) => s.name === 'Resolve configuration');
  if (!resolve.run.includes('::add-mask::')) {
    throw new Error('a token passed as an env var would appear unmasked in logs');
  }
});

check('every output maps to a real step id', () => {
  const ids = new Set(action.runs.steps.map((s) => s.id).filter(Boolean));
  const bad = [];

  for (const [name, out] of Object.entries(action.outputs)) {
    for (const ref of String(out.value).matchAll(/steps\.([A-Za-z0-9_-]+)\./g)) {
      if (!ids.has(ref[1])) bad.push(`${name} -> steps.${ref[1]}`);
    }
  }

  if (bad.length) throw new Error(bad.join(', '));
});

check('a configuration preflight exists and covers every credential input', () => {
  const step = action.runs.steps.find((s) => s.name === 'Check configuration');
  if (!step) throw new Error('no "Check configuration" step');

  // Everything required except project-uuid, which is handled by the skip in
  // "Resolve event context" when previews are simply not switched on.
  const expected = Object.entries(action.inputs)
    .filter(([name, v]) => v.required && name !== 'project-uuid')
    .map(([name]) => name);
  const unchecked = expected.filter((name) => !wired.includes(`inputs.${name}`));

  if (unchecked.length) throw new Error(`not checked by the preflight: ${unchecked.join(', ')}`);
});

check('the preflight labels each item as a secret or a variable', () => {
  const step = action.runs.steps.find((s) => s.name === 'Check configuration');
  const labels = [...step.run.matchAll(/missing\+=\('([^']+)'\)/g)].map((m) => m[1]);

  if (!labels.length) throw new Error('preflight reports nothing');

  const unlabelled = labels.filter((l) => !/ \((secret|variable)\)$/.test(l));
  if (unlabelled.length) throw new Error(`unlabelled: ${unlabelled.join(', ')}`);

  // Store hash and channel id are configuration, not credentials.
  for (const name of ['BIGCOMMERCE_STORE_HASH', 'BIGCOMMERCE_CHANNEL_ID']) {
    if (!labels.includes(`${name} (variable)`)) throw new Error(`${name} is not labelled a variable`);
  }
  for (const name of ['BIGCOMMERCE_ACCESS_TOKEN', 'BIGCOMMERCE_STOREFRONT_TOKEN', 'AUTH_SECRET']) {
    if (!labels.includes(`${name} (secret)`)) throw new Error(`${name} is not labelled a secret`);
  }
});

check('the reusable workflow only takes real credentials as secrets', () => {
  const wf = load(reusable);
  const declared = Object.keys(wf.on.workflow_call.secrets || {});
  const expected = ['access-token', 'storefront-token', 'auth-secret'];
  const extra = declared.filter((s) => !expected.includes(s));
  if (extra.length) throw new Error(`should not be secrets: ${extra.join(', ')}`);
});

console.log('\nworkflows and examples');

const examples = ['with-action.yml', 'with-reusable-workflow.yml'].map((f) => join(ROOT, 'examples', f));

for (const file of [reusable, ...examples]) {
  check(`parses: ${file.replace(REPO_ROOT + '/', '')}`, () => load(file));
}

check('the reusable workflow points at this package', () => {
  const wf = load(reusable);
  const step = wf.jobs.preview.steps.find((s) => s.uses);
  if (!step.uses.includes('packages/deployment-preview-action')) {
    throw new Error(`points at "${step.uses}"`);
  }
});

check('every input the reusable workflow passes exists on the action', () => {
  const wf = load(reusable);
  const step = wf.jobs.preview.steps.find((s) => s.uses);
  const unknown = Object.keys(step.with).filter((k) => !(k in action.inputs));
  if (unknown.length) throw new Error(`unknown inputs: ${unknown.join(', ')}`);
});

check('the reusable workflow supplies configuration through job env', () => {
  const job = load(reusable).jobs.preview;
  const expected = ['BIGCOMMERCE_PREVIEW_PROJECT_UUID', 'BIGCOMMERCE_STORE_HASH',
                    'BIGCOMMERCE_CHANNEL_ID', 'BIGCOMMERCE_ACCESS_TOKEN',
                    'BIGCOMMERCE_STOREFRONT_TOKEN', 'AUTH_SECRET'];
  const missing = expected.filter((k) => !(k in (job.env || {})));
  if (missing.length) throw new Error(`missing job env: ${missing.join(', ')}`);
});

check('both in-repo pins track the package major', () => {
  // The release workflow enforces this too, but failing here means a version
  // bump that forgets the pins is caught in review, not at release time.
  const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const major = version.split('.')[0];
  const expected = `@preview-action-v${major}`;

  const pins = [
    join(REPO_ROOT, 'core', '.github', 'workflows', 'preview-deployment.yml'),
    reusable,
  ];

  const wrong = pins
    .filter((f) => !readFileSync(f, 'utf8').includes(expected))
    .map((f) => f.replace(REPO_ROOT + '/', ''));

  if (wrong.length) throw new Error(`do not reference ${expected}: ${wrong.join(', ')}`);
});

check('the check-run lifecycle is opened and always closed', () => {
  const steps = action.runs.steps;
  const open = steps.find((s) => s.name === 'Open a check run');
  if (!open) throw new Error('no step opens a check run');
  if (open.id !== 'check') throw new Error('the opening step needs id "check" for later steps to reference');

  // Every exit path has to close it, or the pull request keeps a check
  // spinning forever.
  const closers = steps.filter((s) => (s.run || '').includes('check-runs/$CHECK_ID'));
  const conclusions = closers.flatMap((s) => [...s.run.matchAll(/conclusion='([a-z]+)'/g)].map((m) => m[1]));

  if (!conclusions.includes('success')) throw new Error('no success path closes the check run');
  if (!conclusions.includes('failure')) throw new Error('no failure path closes the check run');
});

check('a missing checks permission does not fail the deploy', () => {
  const open = action.runs.steps.find((s) => s.name === 'Open a check run');
  if (!/\|\| true/.test(open.run)) {
    throw new Error('creating the check run is fatal; consumers without checks:write would break');
  }
});

check('workflows that call the action directly request checks:write', () => {
  const files = [reusable, join(ROOT, 'examples', 'with-action.yml')];
  const missing = files
    .filter((f) => !(load(f).permissions || {})['checks'])
    .map((f) => f.replace(REPO_ROOT + '/', ''));

  if (missing.length) throw new Error(`missing checks: write in ${missing.join(', ')}`);
});

check('the redeploy check row is never named after a job', () => {
  // GitHub rejects API changes to the check runs it manages for a job. A shared
  // name means the reuse lookup finds one of those and the PATCH 403s, which is
  // what used to fail a redeploy after it had already deployed.
  const expected = action.inputs['check-name'].default;
  const clashing = [reusable, join(ROOT, 'examples', 'with-action.yml')]
    .flatMap((f) => Object.values(load(f).jobs).map((job) => [f, job.name]))
    .filter(([, name]) => name === expected)
    .map(([f]) => f.replace(REPO_ROOT + '/', ''));

  if (clashing.length) throw new Error(`job named "${expected}" in ${clashing.join(', ')}`);
});

check('a redeploy opens its own check row instead of reusing one', () => {
  // A check run belongs to the run that created it. Another run's PATCH is
  // accepted and silently ignored, so a reused row would still show the
  // previous result while this deploy was running -- verified against the API.
  const step = action.runs.steps.find((s) => s.name === 'Open a check run');
  if (!step) throw new Error('no "Open a check run" step');

  if (/--method PATCH/.test(step.run)) {
    throw new Error('the step patches a check run; only the run that created one can update it');
  }

  if (!/-f external_id=/.test(step.run)) {
    throw new Error('the check run is created without an external_id');
  }
});

check('a refused check-run request cannot be mistaken for an id', () => {
  // gh writes error bodies to stdout, so `id=$(gh api ... || true)` captures
  // JSON on failure. That has to be filtered down to digits.
  const step = action.runs.steps.find((s) => s.name === 'Open a check run');

  if (!/case "\$id" in/.test(step.run) || !/\*\[!0-9\]\*/.test(step.run)) {
    throw new Error('the captured id is not filtered to digits');
  }
});

check('a check-run failure cannot fail a deploy that already succeeded', () => {
  const closing = action.runs.steps.filter((s) => /^(Mark the command as done|Report command failure)$/.test(s.name));
  if (closing.length !== 2) throw new Error(`expected 2 closing steps, found ${closing.length}`);

  const strict = closing
    .filter((s) => /check-runs\/\$CHECK_ID/.test(s.run) && !/\|\| echo '::warning::/.test(s.run))
    .map((s) => s.name);

  if (strict.length) throw new Error(`patch is fatal in: ${strict.join(', ')}`);
});

check('every env fallback is documented in the README', () => {
  // The action.yml no longer marks these required, so the README table is the
  // only place a consumer learns what has to be supplied.
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const resolve = action.runs.steps.find((s) => s.name === 'Resolve configuration');
  const fallbacks = [...resolve.run.matchAll(/:-\$\{([A-Z_]+):-\}\}/g)].map((m) => m[1]);

  const undocumented = fallbacks.filter((name) => !readme.includes(name));
  if (undocumented.length) throw new Error(`not in the README: ${undocumented.join(', ')}`);
});

check('the README describes the comments the code actually posts', () => {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const source = readFileSync(join(ROOT, 'scripts', 'catalyst-preview.mjs'), 'utf8');

  // The notice must stay pull-request-agnostic, or it goes stale the moment a
  // third pull request takes the preview and the sweep would have to revisit it.
  const replaced = source.slice(source.indexOf('function replacedBody'));
  const body = replaced.slice(0, replaced.indexOf('\n}'));
  if (/#\$\{/.test(body) || /#\d/.test(body)) {
    throw new Error('replacedBody names a pull request; the README says it does not');
  }

  if (!readme.includes('does not name the pull request that took over')) {
    throw new Error('README no longer explains why the notice is pull-request-agnostic');
  }
});

check('the release process is documented and linked', () => {
  const releases = join(ROOT, 'RELEASES.md');
  if (!fs.existsSync(releases)) throw new Error('RELEASES.md is missing');
  if (!readFileSync(join(ROOT, 'README.md'), 'utf8').includes('RELEASES.md')) {
    throw new Error('README does not link to RELEASES.md');
  }
});

check('no reference still points at a standalone action repository', () => {
  const stale = [reusable, ...examples, join(ROOT, 'README.md')]
    .filter((f) => readFileSync(f, 'utf8').includes('catalyst-deployment-preview-action'));
  if (stale.length) throw new Error(`stale refs in: ${stale.join(', ')}`);
});

// js-yaml reads a keyword with nothing under it as null and moves on, but the
// runner refuses to load the manifest at all: "Unexpected type 'NullToken'
// encountered while reading 'environment'". Nothing else here catches that,
// because every other test works on the parsed tree, where the key is simply
// absent-looking.
check('no step declares an empty env or with block', () => {
  const empties = [];

  const scan = (steps, where) =>
    (steps ?? []).forEach((step, i) => {
      for (const key of ['env', 'with']) {
        if (key in step && step[key] === null) {
          empties.push(`${where} step ${i + 1} (${step.name ?? step.uses}): ${key}`);
        }
      }
    });

  scan(action.runs.steps, 'action.yml');

  for (const file of [reusable, ...examples]) {
    const doc = load(file);
    for (const [name, job] of Object.entries(doc.jobs ?? {})) scan(job.steps, `${file} job ${name}`);
  }

  if (empties.length) throw new Error(`empty blocks: ${empties.join('; ')}`);
});

console.log(failures ? `\n${failures} failing\n` : '\nall passing\n');
process.exit(failures ? 1 : 0);
