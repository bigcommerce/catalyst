const fs = require('fs');

module.exports = async ({ github, context, reportPath = '/tmp/unlighthouse-report.md', metaPath = '/tmp/unlighthouse-meta.json' }) => {
  // The failed check already marks the commit; the comment explains why.
  const { failed } = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const sha = context.payload.deployment?.sha;

  if (!failed || !sha) return;

  const runUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
  const marker = `<!-- canary-lighthouse-report -->`;
  const body = marker + '\n' + fs.readFileSync(reportPath, 'utf-8') + `\n[Full Unlighthouse report →](${runUrl})\n`;

  await github.rest.repos.createCommitComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: sha,
    body,
  });
};
