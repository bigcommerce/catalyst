// Nothing compiles action.yml, so a YAML or shell mistake would only surface in
// a consumer's repository. Parse it here, and syntax-check every run block.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
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
    if (result.status !== 0) broken.push(`${step.name}: ${result.stderr.trim()}`);
  }

  if (broken.length) throw new Error(broken.join('\n        '));
});

check('required inputs have no default', () => {
  const wrong = Object.entries(action.inputs)
    .filter(([, v]) => v.required && v.default !== undefined)
    .map(([k]) => k);
  if (wrong.length) throw new Error(`required inputs with defaults: ${wrong.join(', ')}`);
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
  // The env keys are shell names; what matters is which inputs they read.
  const wired = JSON.stringify(step.env || {});
  const unchecked = expected.filter((name) => !wired.includes(`inputs.${name}`));

  if (unchecked.length) throw new Error(`not checked by the preflight: ${unchecked.join(', ')}`);
});

check('the preflight labels each item as a secret or a variable', () => {
  const step = action.runs.steps.find((s) => s.name === 'Check configuration');
  const labels = [...step.run.matchAll(/missing\+=\('([^']+)'\)/g)].map((m) => m[1]);

  if (!labels.length) throw new Error('preflight reports nothing');

  const unlabelled = labels.filter((l) => !/^(secret|variable) /.test(l));
  if (unlabelled.length) throw new Error(`unlabelled: ${unlabelled.join(', ')}`);

  // Store hash and channel id are configuration, not credentials.
  for (const name of ['BIGCOMMERCE_STORE_HASH', 'BIGCOMMERCE_CHANNEL_ID']) {
    if (!labels.includes(`variable ${name}`)) throw new Error(`${name} is not labelled a variable`);
  }
  for (const name of ['BIGCOMMERCE_PREVIEW_DEPLOYMENT_ACCESS_TOKEN', 'BIGCOMMERCE_STOREFRONT_TOKEN', 'AUTH_SECRET']) {
    if (!labels.includes(`secret ${name}`)) throw new Error(`${name} is not labelled a secret`);
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

check('every required action input is supplied by the reusable workflow', () => {
  const wf = load(reusable);
  const step = wf.jobs.preview.steps.find((s) => s.uses);
  const required = Object.entries(action.inputs).filter(([, v]) => v.required).map(([k]) => k);
  const missing = required.filter((k) => !(k in step.with));
  if (missing.length) throw new Error(`missing: ${missing.join(', ')}`);
});

check('no reference still points at a standalone action repository', () => {
  const stale = [reusable, ...examples, join(ROOT, 'README.md')]
    .filter((f) => readFileSync(f, 'utf8').includes('catalyst-deployment-preview-action'));
  if (stale.length) throw new Error(`stale refs in: ${stale.join(', ')}`);
});

console.log(failures ? `\n${failures} failing\n` : '\nall passing\n');
process.exit(failures ? 1 : 0);
