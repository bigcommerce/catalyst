#!/usr/bin/env node
/**
 * Drives pull request previews for Catalyst native hosting.
 *
 * Every preview deploys into one long-lived hosting project, named by
 * PREVIEW_DEPLOYMENT_PROJECT_UUID. Nothing is created, reclaimed or garbage
 * collected, so there is no project allowance to manage -- at the cost of the
 * project serving exactly one pull request at a time.
 *
 * The newest open pull request deploys automatically. Any other pull request
 * takes the preview over by commenting `redeploy preview`, which is the only
 * way an older branch reaches the shared project.
 *
 * Subcommands:
 *   check     Decide whether this run may deploy, and record why.
 *   hostname  Print the shared project's URL.
 *   announce  Record a successful deploy on this PR, and mark any other PR
 *             whose comment now points at code the preview no longer serves.
 *   defer     Record that this PR did not deploy, and how to take the preview.
 *
 * Results are appended to $GITHUB_OUTPUT when running under Actions.
 */

import { appendFile } from 'node:fs/promises';

const API_HOST = process.env.CATALYST_API_HOST || 'api.bigcommerce.com';
const STORE_HASH = required('CATALYST_STORE_HASH');
const ACCESS_TOKEN = required('CATALYST_ACCESS_TOKEN');
const PROJECT_UUID = required('PREVIEW_DEPLOYMENT_PROJECT_UUID');
const GITHUB_TOKEN = required('GITHUB_TOKEN');
const REPOSITORY = required('GITHUB_REPOSITORY');
const PR_NUMBER = Number(required('PR_NUMBER'));

// Set by the action when the run came from the takeover command.
const IS_TAKEOVER = process.env.IS_TAKEOVER === 'true';

// When false, nothing deploys without an explicit command.
const AUTO_DEPLOY_NEWEST = process.env.AUTO_DEPLOY_NEWEST !== 'false';

const MARKER = '<!-- catalyst-preview -->';
const DEPLOYED_HEADING = '**Preview deployed**';

if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(PROJECT_UUID)) {
  fail(`PREVIEW_DEPLOYMENT_PROJECT_UUID is not a UUID: "${PROJECT_UUID}"`);
}

if (!Number.isInteger(PR_NUMBER) || PR_NUMBER < 1) {
  fail(`PR_NUMBER must be a positive integer, got "${process.env.PR_NUMBER}"`);
}

function required(name) {
  const value = process.env[name];

  if (!value) fail(`Missing required environment variable: ${name}`);

  return value;
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function setOutput(key, value) {
  console.log(`  ${key}=${value}`);

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
}

async function bigcommerce(path) {
  const response = await fetch(
    `https://${API_HOST}/stores/${STORE_HASH}/v3/infrastructure${path}`,
    {
      headers: {
        'X-Auth-Token': ACCESS_TOKEN,
        Accept: 'application/json',
      },
    },
  );

  if (response.status === 403 || response.status === 404) {
    fail(
      `The Infrastructure Projects API rejected the request (${response.status}). ` +
        'Confirm the store is enabled for Catalyst native hosting and that the access ' +
        'token carries the store_infrastructure_projects_manage scope.',
    );
  }

  if (!response.ok) {
    fail(`GET ${path} failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function github(path, init = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok && response.status !== 404) {
    fail(`${init.method ?? 'GET'} ${path} failed: ${response.status} ${await response.text()}`);
  }

  return response;
}

/**
 * The newest open pull request, which is the only one allowed to deploy without
 * an explicit command. Pull request numbers share the issue sequence, so the
 * most recently created is always the highest numbered.
 */
async function newestOpenPullRequest() {
  const response = await github(
    `/repos/${REPOSITORY}/pulls?state=open&sort=created&direction=desc&per_page=1`,
  );
  const [newest] = await response.json();

  return newest?.number ?? null;
}

/**
 * Walks open pull requests newest-activity-first, yielding page by page. The
 * pull request holding the preview was commented on by this action when it
 * deployed, which bumped its `updated_at`, so it sorts near the front and the
 * caller stops long before the end of the list.
 */
async function* openPullRequestsByRecency() {
  for (let page = 1; ; page++) {
    const response = await github(
      `/repos/${REPOSITORY}/pulls?state=open&sort=updated&direction=desc&per_page=100&page=${page}`,
    );
    const batch = await response.json();

    for (const pull of batch) yield pull.number;

    if (batch.length < 100) return;
  }
}

async function findPreviewComment(pullNumber) {
  for (let page = 1; page <= 3; page++) {
    const response = await github(
      `/repos/${REPOSITORY}/issues/${pullNumber}/comments?per_page=100&page=${page}`,
    );

    if (response.status === 404) return null;

    const batch = await response.json();
    const match = batch.find((comment) => comment.body?.startsWith(MARKER));

    if (match) return { id: match.id, body: match.body };
    if (batch.length < 100) break;
  }

  return null;
}

const createComment = (pullNumber, body) =>
  github(`/repos/${REPOSITORY}/issues/${pullNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

const patchComment = (id, body) =>
  github(`/repos/${REPOSITORY}/issues/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  });

const deleteComment = (id) =>
  github(`/repos/${REPOSITORY}/issues/comments/${id}`, { method: 'DELETE' });

/**
 * Replaces the preview comment so the update arrives as new activity. Editing
 * in place sends no notification and leaves the comment wherever it first
 * landed, which is how a changed deployment goes unnoticed.
 */
async function announceLoudly(pullNumber, body) {
  const existing = await findPreviewComment(pullNumber);

  if (existing) await deleteComment(existing.id);

  await createComment(pullNumber, body);
}

/** Updates the preview comment in place, or creates it when absent. */
async function announceQuietly(pullNumber, body) {
  const existing = await findPreviewComment(pullNumber);

  if (!existing) {
    await createComment(pullNumber, body);

    return;
  }

  if (existing.body !== body) await patchComment(existing.id, body);
}

function deployedBody(url) {
  const commit = (process.env.COMMIT || '').slice(0, 7);
  const runUrl = process.env.RUN_URL || '';
  const meta = commit
    ? `Commit \`${commit}\` · [build log](${runUrl})`
    : `[build log](${runUrl})`;

  return `${MARKER}\n${DEPLOYED_HEADING} → ${url}\n\n${meta}\n`;
}

function replacedBody() {
  return (
    `${MARKER}\n**Preview replaced** — the shared preview now serves another pull ` +
    `request, so it no longer reflects these changes.\n\n` +
    `Comment \`redeploy preview\` to point it back here.\n`
  );
}

async function check() {
  if (IS_TAKEOVER) {
    console.log(`PR #${PR_NUMBER} requested the preview explicitly`);
    await setOutput('should_deploy', 'true');
    await setOutput('reason', 'takeover');

    return;
  }

  if (!AUTO_DEPLOY_NEWEST) {
    console.log('Automatic deploys are disabled; the command is the only way in');
    await setOutput('should_deploy', 'false');
    await setOutput('reason', 'manual-only');

    return;
  }

  const newest = await newestOpenPullRequest();

  if (newest === PR_NUMBER) {
    console.log(`PR #${PR_NUMBER} is the newest open pull request`);
    await setOutput('should_deploy', 'true');
    await setOutput('reason', 'newest');

    return;
  }

  console.log(`PR #${PR_NUMBER} is not the newest open pull request (#${newest})`);
  await setOutput('should_deploy', 'false');
  await setOutput('reason', 'not-newest');
  await setOutput('newest_pr', String(newest ?? ''));
}

async function hostname() {
  const { data } = await bigcommerce('/projects');
  const project = (data ?? []).find((candidate) => candidate.uuid === PROJECT_UUID);

  if (!project) {
    fail(
      `No hosting project with UUID ${PROJECT_UUID} exists on store ${STORE_HASH}. ` +
        'Check PREVIEW_DEPLOYMENT_PROJECT_UUID against `catalyst project list`.',
    );
  }

  const host = project.deployment_hostnames?.[0];

  if (!host) {
    fail(`Project ${project.name} has no deployment hostname yet.`);
  }

  await setOutput('url', `https://${host}`);
  await setOutput('project_name', project.name);
}

async function announce() {
  const url = required('PREVIEW_URL');

  await announceLoudly(PR_NUMBER, deployedBody(url));
  console.log(`  announced on #${PR_NUMBER}`);

  // At most one other pull request advertises the preview, so stop as soon as
  // it is found rather than visiting every open pull request. The notice does
  // not name the pull request that took over, so it never needs rewriting and
  // an already-replaced comment is never touched again.
  for await (const pullNumber of openPullRequestsByRecency()) {
    if (pullNumber === PR_NUMBER) continue;

    const existing = await findPreviewComment(pullNumber);

    if (!existing?.body.startsWith(`${MARKER}\n${DEPLOYED_HEADING}`)) continue;

    // Losing the preview is worth a notification, so replace the comment
    // rather than editing it in place.
    await deleteComment(existing.id);
    await createComment(pullNumber, replacedBody());
    console.log(`  notified #${pullNumber} that its preview was replaced`);

    return;
  }

  console.log('  no other pull request was holding the preview');
}

async function defer() {
  const newest = process.env.NEWEST_PR || '';
  const target = newest ? `the newest pull request (#${newest})` : 'the newest pull request';

  // Quiet on purpose: this fires on every push to an older branch, and a
  // notification each time would be noise.
  await announceQuietly(
    PR_NUMBER,
    `${MARKER}\n**Preview not deployed** — the shared preview is reserved for ${target}.\n\n` +
      `Comment \`redeploy preview\` here to point it at these changes instead.\n`,
  );

  console.log(`  recorded deferral on #${PR_NUMBER}`);
}

const commands = { check, hostname, announce, defer };
const command = commands[process.argv[2]];

if (!command) fail(`Usage: catalyst-preview.mjs <${Object.keys(commands).join('|')}>`);

await command();
