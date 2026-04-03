import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const postComment = require('../post-unlighthouse-pr-comment.js') as (args: {
  github: ReturnType<typeof makeGithub>['github'];
  context: ReturnType<typeof makeContext>;
  provider?: string;
  reportPath?: string;
  metaPath?: string;
}) => Promise<void>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Comment {
  id: number;
  body: string;
}

interface Calls {
  listPrs: object[];
  listComments: object[];
  create: object[];
  update: object[];
}

function makeGithub(opts: { prs?: { number: number }[]; comments?: Comment[] } = {}) {
  const calls: Calls = { listPrs: [], listComments: [], create: [], update: [] };
  const github = {
    rest: {
      repos: {
        listPullRequestsAssociatedWithCommit: async (args: object) => {
          calls.listPrs.push(args);
          return { data: opts.prs ?? [{ number: 42 }] };
        },
      },
      issues: {
        listComments: async (args: object) => {
          calls.listComments.push(args);
          return { data: opts.comments ?? [] };
        },
        createComment: async (args: object) => {
          calls.create.push(args);
        },
        updateComment: async (args: object) => {
          calls.update.push(args);
        },
      },
    },
  };
  return { github, calls };
}

function makeContext({
  owner = 'test-owner',
  repo = 'test-repo',
  sha = 'abc123',
  runId = 99,
}: {
  owner?: string;
  repo?: string;
  sha?: string;
  runId?: number;
} = {}) {
  return {
    repo: { owner, repo },
    runId,
    payload: {
      deployment: { sha },
    },
  };
}

let tmpDir: string;
let reportPath: string;
let metaPath: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `post-unlighthouse-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  reportPath = join(tmpDir, 'report.md');
  metaPath = join(tmpDir, 'meta.json');
  writeFileSync(reportPath, '## Unlighthouse Performance Comparison\n\nSome results.');
  writeFileSync(metaPath, JSON.stringify({ hasChanges: true }));
});

// ---------------------------------------------------------------------------
// Early exits
// ---------------------------------------------------------------------------

describe('early exits', () => {
  it('does nothing when hasChanges is false', async () => {
    writeFileSync(metaPath, JSON.stringify({ hasChanges: false }));
    const { github, calls } = makeGithub();
    await postComment({ github, context: makeContext(), reportPath, metaPath });

    assert.equal(calls.create.length, 0);
    assert.equal(calls.update.length, 0);
  });

  it('does nothing when deployment sha is missing', async () => {
    const { github, calls } = makeGithub();
    const context = { ...makeContext(), payload: {} };
    await postComment({ github, context, reportPath, metaPath });

    assert.equal(calls.create.length, 0);
    assert.equal(calls.update.length, 0);
  });

  it('does nothing when no PR is associated with the sha', async () => {
    const { github, calls } = makeGithub({ prs: [] });
    await postComment({ github, context: makeContext(), reportPath, metaPath });

    assert.equal(calls.create.length, 0);
    assert.equal(calls.update.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Comment creation
// ---------------------------------------------------------------------------

describe('comment creation', () => {
  it('creates a comment when no existing comment has the marker', async () => {
    const { github, calls } = makeGithub({ comments: [] });
    await postComment({ github, context: makeContext(), reportPath, metaPath });

    assert.equal(calls.create.length, 1);
    assert.equal(calls.update.length, 0);
  });

  it('uses the PR number found from the commit sha', async () => {
    const { github, calls } = makeGithub({ prs: [{ number: 77 }] });
    await postComment({ github, context: makeContext(), reportPath, metaPath });

    assert.equal((calls.create[0] as { issue_number: number }).issue_number, 77);
  });

  it('passes the correct owner and repo', async () => {
    const { github, calls } = makeGithub();
    await postComment({
      github,
      context: makeContext({ owner: 'my-org', repo: 'my-repo' }),
      reportPath,
      metaPath,
    });

    assert.equal((calls.create[0] as { owner: string }).owner, 'my-org');
    assert.equal((calls.create[0] as { repo: string }).repo, 'my-repo');
  });
});

// ---------------------------------------------------------------------------
// Comment update
// ---------------------------------------------------------------------------

describe('comment update', () => {
  it('updates an existing comment that contains the marker', async () => {
    const marker = '<!-- unlighthouse-vercel-report -->';
    const existing = { id: 55, body: `${marker}\nOld content` };
    const { github, calls } = makeGithub({ comments: [existing] });
    await postComment({ github, context: makeContext(), provider: 'vercel', reportPath, metaPath });

    assert.equal(calls.update.length, 1);
    assert.equal(calls.create.length, 0);
    assert.equal((calls.update[0] as { comment_id: number }).comment_id, 55);
  });

  it('creates a new comment when existing comments do not contain the marker', async () => {
    const comments = [
      { id: 1, body: 'unrelated comment' },
      { id: 2, body: '<!-- some-other-marker -->\nOther report' },
    ];
    const { github, calls } = makeGithub({ comments });
    await postComment({ github, context: makeContext(), provider: 'vercel', reportPath, metaPath });

    assert.equal(calls.create.length, 1);
    assert.equal(calls.update.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Comment body
// ---------------------------------------------------------------------------

describe('comment body', () => {
  it('starts with the provider-specific marker', async () => {
    const { github, calls } = makeGithub();
    await postComment({ github, context: makeContext(), provider: 'vercel', reportPath, metaPath });

    const body = (calls.create[0] as { body: string }).body;

    assert.ok(
      body.startsWith('<!-- unlighthouse-vercel-report -->\n'),
      `Body should start with vercel marker, got: ${body.slice(0, 60)}`,
    );
  });

  it('uses provider name in the marker', async () => {
    const { github, calls } = makeGithub();
    await postComment({ github, context: makeContext(), provider: 'cloudflare', reportPath, metaPath });

    const body = (calls.create[0] as { body: string }).body;

    assert.ok(body.includes('<!-- unlighthouse-cloudflare-report -->'));
  });

  it('includes the report file content', async () => {
    const { github, calls } = makeGithub();
    await postComment({ github, context: makeContext(), reportPath, metaPath });

    const body = (calls.create[0] as { body: string }).body;

    assert.ok(body.includes('## Unlighthouse Performance Comparison'));
    assert.ok(body.includes('Some results.'));
  });

  it('includes the workflow run link', async () => {
    const { github, calls } = makeGithub();
    await postComment({
      github,
      context: makeContext({ owner: 'my-org', repo: 'my-repo', runId: 12345 }),
      reportPath,
      metaPath,
    });

    const body = (calls.create[0] as { body: string }).body;

    assert.ok(
      body.includes('https://github.com/my-org/my-repo/actions/runs/12345'),
      'Body should contain the workflow run URL',
    );
  });

  it('run link is not inside a table (preceded by a blank line)', async () => {
    const { github, calls } = makeGithub();
    await postComment({ github, context: makeContext(), reportPath, metaPath });

    const body = (calls.create[0] as { body: string }).body;
    const linkIndex = body.indexOf('[Full Unlighthouse report');

    assert.ok(linkIndex > 0, 'Run link should be present');
    // The character before the link text should be a newline (blank line separator)
    assert.equal(body[linkIndex - 1], '\n', 'Run link should be preceded by a blank line');
  });
});

// ---------------------------------------------------------------------------
// Sha lookup
// ---------------------------------------------------------------------------

describe('sha lookup', () => {
  it('passes the deployment sha to listPullRequestsAssociatedWithCommit', async () => {
    const { github, calls } = makeGithub();
    await postComment({
      github,
      context: makeContext({ sha: 'deadbeef' }),
      reportPath,
      metaPath,
    });

    assert.equal(
      (calls.listPrs[0] as { commit_sha: string }).commit_sha,
      'deadbeef',
    );
  });
});
