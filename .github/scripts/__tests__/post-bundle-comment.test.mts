import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const postBundleComment = require('../post-bundle-comment.js') as (args: {
  github: ReturnType<typeof makeGithub>['github'];
  context: ReturnType<typeof makeContext>;
  reportPath?: string;
}) => Promise<void>;

const marker = '<!-- bundle-size-report -->';

let tmpDir: string;
let reportPath: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `post-bundle-test-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  reportPath = join(tmpDir, 'report.md');
  writeFileSync(reportPath, '## Bundle Size Report\n\nSome content here.');
});

interface Comment {
  id: number;
  body: string;
}

interface GithubCalls {
  create: object[];
  update: object[];
  list: object[];
}

// Helper to create a mock github object and record calls
function makeGithub(existingComments: Comment[] = []) {
  const calls: GithubCalls = { create: [], update: [], list: [] };
  const github = {
    rest: {
      issues: {
        listComments: async (args: object) => {
          calls.list.push(args);
          return { data: existingComments };
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

function makeContext({ owner = 'test-owner', repo = 'test-repo', number = 42 } = {}) {
  return {
    repo: { owner, repo },
    issue: { number },
  };
}

describe('post-bundle-comment', () => {
  it('creates a new comment when no existing comment contains the marker', async () => {
    const { github, calls } = makeGithub([]);
    await postBundleComment({ github, context: makeContext(), reportPath });

    assert.equal(calls.create.length, 1, 'Should create exactly one comment');
    assert.equal(calls.update.length, 0, 'Should not update any comment');
  });

  it('updates existing comment when marker found', async () => {
    const existing = { id: 99, body: `${marker}\nOld content` };
    const { github, calls } = makeGithub([existing]);
    await postBundleComment({ github, context: makeContext(), reportPath });

    assert.equal(calls.update.length, 1, 'Should update exactly one comment');
    assert.equal(calls.create.length, 0, 'Should not create a new comment');
    assert.equal((calls.update[0] as { comment_id: number }).comment_id, 99, 'Should update the correct comment by id');
  });

  it('body always starts with marker and newline', async () => {
    const { github, calls } = makeGithub([]);
    await postBundleComment({ github, context: makeContext(), reportPath });

    const body = (calls.create[0] as { body: string }).body;

    assert.ok(body.startsWith(`${marker}\n`), `Body should start with marker, got: ${body.slice(0, 50)}`);
  });

  it('updated comment body also starts with marker and newline', async () => {
    const existing = { id: 7, body: `${marker}\nStale content` };
    const { github, calls } = makeGithub([existing]);
    await postBundleComment({ github, context: makeContext(), reportPath });

    const body = (calls.update[0] as { body: string }).body;

    assert.ok(body.startsWith(`${marker}\n`));
  });

  it('includes report file content in the comment body', async () => {
    const { github, calls } = makeGithub([]);
    await postBundleComment({ github, context: makeContext(), reportPath });

    const body = (calls.create[0] as { body: string }).body;

    assert.ok(body.includes('## Bundle Size Report'), 'Should include report heading');
    assert.ok(body.includes('Some content here.'), 'Should include report body content');
  });

  it('reads report from a custom reportPath', async () => {
    const customPath = join(tmpDir, 'custom.md');

    writeFileSync(customPath, 'Custom report content for testing!');

    const { github, calls } = makeGithub([]);
    await postBundleComment({ github, context: makeContext(), reportPath: customPath });

    assert.ok((calls.create[0] as { body: string }).body.includes('Custom report content for testing!'));
  });

  it('passes correct owner, repo, issue_number from context to listComments', async () => {
    const { github, calls } = makeGithub([]);
    await postBundleComment({
      github,
      context: makeContext({ owner: 'my-org', repo: 'my-repo', number: 123 }),
      reportPath,
    });

    assert.equal((calls.list[0] as { owner: string }).owner, 'my-org');
    assert.equal((calls.list[0] as { repo: string }).repo, 'my-repo');
    assert.equal((calls.list[0] as { issue_number: number }).issue_number, 123);
  });

  it('passes correct owner, repo, issue_number from context to createComment', async () => {
    const { github, calls } = makeGithub([]);
    await postBundleComment({
      github,
      context: makeContext({ owner: 'my-org', repo: 'my-repo', number: 123 }),
      reportPath,
    });

    assert.equal((calls.create[0] as { owner: string }).owner, 'my-org');
    assert.equal((calls.create[0] as { repo: string }).repo, 'my-repo');
    assert.equal((calls.create[0] as { issue_number: number }).issue_number, 123);
  });

  it('passes correct owner and repo to updateComment', async () => {
    const existing = { id: 55, body: `${marker}\nOld` };
    const { github, calls } = makeGithub([existing]);
    await postBundleComment({
      github,
      context: makeContext({ owner: 'org2', repo: 'repo2', number: 7 }),
      reportPath,
    });

    assert.equal((calls.update[0] as { owner: string }).owner, 'org2');
    assert.equal((calls.update[0] as { repo: string }).repo, 'repo2');
  });

  it('uses the first comment that contains the marker (not just exact match)', async () => {
    const comments = [
      { id: 1, body: 'Just a regular comment' },
      { id: 2, body: `${marker}\nFirst bundle report` },
      { id: 3, body: `${marker}\nSecond bundle report` },
    ];
    const { github, calls } = makeGithub(comments);
    await postBundleComment({ github, context: makeContext(), reportPath });

    assert.equal(calls.update.length, 1);
    assert.equal((calls.update[0] as { comment_id: number }).comment_id, 2, 'Should update the first matching comment');
  });

  it('creates comment when existing comments do not contain the marker', async () => {
    const comments = [
      { id: 10, body: 'No marker here' },
      { id: 11, body: 'Also no marker' },
    ];
    const { github, calls } = makeGithub(comments);
    await postBundleComment({ github, context: makeContext(), reportPath });

    assert.equal(calls.create.length, 1);
    assert.equal(calls.update.length, 0);
  });
});
