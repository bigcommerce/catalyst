import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const postReport = require('../post-unlighthouse-commit-comment.js') as (args: {
  github: ReturnType<typeof makeGithub>['github'];
  context: ReturnType<typeof makeContext>;
  reportPath?: string;
  metaPath?: string;
}) => Promise<void>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Calls {
  createCommitComment: object[];
}

function makeGithub() {
  const calls: Calls = { createCommitComment: [] };
  const github = {
    rest: {
      repos: {
        createCommitComment: async (args: object) => {
          calls.createCommitComment.push(args);
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

let reportPath: string;
let metaPath: string;

beforeEach(() => {
  const tmpDir = join(tmpdir(), `post-unlighthouse-report-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  reportPath = join(tmpDir, 'report.md');
  metaPath = join(tmpDir, 'meta.json');
  writeFileSync(reportPath, '## Unlighthouse Comparison — Vercel\n\nSome results.');
  writeFileSync(metaPath, JSON.stringify({ failed: true }));
});

// ---------------------------------------------------------------------------
// Early exits
// ---------------------------------------------------------------------------

describe('early exits', () => {
  it('does nothing when the check passed', async () => {
    writeFileSync(metaPath, JSON.stringify({ failed: false }));
    const { github, calls } = makeGithub();
    await postReport({ github, context: makeContext(), reportPath, metaPath });

    assert.equal(calls.createCommitComment.length, 0);
  });

  it('does nothing when deployment sha is missing', async () => {
    const { github, calls } = makeGithub();
    const context = { ...makeContext(), payload: {} };
    await postReport({ github, context, reportPath, metaPath });

    assert.equal(calls.createCommitComment.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Commit comment creation
// ---------------------------------------------------------------------------

describe('commit comment creation', () => {
  it('creates a commit comment with the deployment sha', async () => {
    const { github, calls } = makeGithub();
    await postReport({ github, context: makeContext({ sha: 'deadbeef' }), reportPath, metaPath });

    assert.equal(calls.createCommitComment.length, 1);
    assert.equal(
      (calls.createCommitComment[0] as { commit_sha: string }).commit_sha,
      'deadbeef',
    );
  });

  it('passes the correct owner and repo', async () => {
    const { github, calls } = makeGithub();
    await postReport({
      github,
      context: makeContext({ owner: 'my-org', repo: 'my-repo' }),
      reportPath,
      metaPath,
    });

    assert.equal((calls.createCommitComment[0] as { owner: string }).owner, 'my-org');
    assert.equal((calls.createCommitComment[0] as { repo: string }).repo, 'my-repo');
  });
});

// ---------------------------------------------------------------------------
// Comment body
// ---------------------------------------------------------------------------

describe('comment body', () => {
  it('starts with the canary marker', async () => {
    const { github, calls } = makeGithub();
    await postReport({ github, context: makeContext(), reportPath, metaPath });

    const body = (calls.createCommitComment[0] as { body: string }).body;

    assert.ok(
      body.startsWith('<!-- canary-lighthouse-report -->\n'),
      `Body should start with marker, got: ${body.slice(0, 60)}`,
    );
  });

  it('includes the report file content', async () => {
    const { github, calls } = makeGithub();
    await postReport({ github, context: makeContext(), reportPath, metaPath });

    const body = (calls.createCommitComment[0] as { body: string }).body;

    assert.ok(body.includes('## Unlighthouse Comparison'));
    assert.ok(body.includes('Some results.'));
  });

  it('includes the workflow run link', async () => {
    const { github, calls } = makeGithub();
    await postReport({
      github,
      context: makeContext({ owner: 'my-org', repo: 'my-repo', runId: 12345 }),
      reportPath,
      metaPath,
    });

    const body = (calls.createCommitComment[0] as { body: string }).body;

    assert.ok(
      body.includes('https://github.com/my-org/my-repo/actions/runs/12345'),
      'Body should contain the workflow run URL',
    );
  });

  it('run link is preceded by a newline', async () => {
    const { github, calls } = makeGithub();
    await postReport({ github, context: makeContext(), reportPath, metaPath });

    const body = (calls.createCommitComment[0] as { body: string }).body;
    const linkIndex = body.indexOf('[Full Unlighthouse report');

    assert.ok(linkIndex > 0, 'Run link should be present');
    assert.equal(body[linkIndex - 1], '\n', 'Run link should be preceded by a newline');
  });
});
