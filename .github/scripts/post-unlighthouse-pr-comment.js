const fs = require('fs');

module.exports = async ({ github, context, provider = 'unknown', reportPath = '/tmp/unlighthouse-report.md', metaPath = '/tmp/unlighthouse-meta.json' }) => {
  const { failed } = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

  // Find PR from commit SHA (context.issue.number is 0 in deployment_status events;
  // deployment.ref is also the SHA in Vercel deployments, not the branch name)
  const sha = context.payload.deployment?.sha;

  if (!sha) return;

  const { data: prs } = await github.rest.repos.listPullRequestsAssociatedWithCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: sha,
  });

  const prNumber = prs[0]?.number;

  if (!prNumber) return;

  const runUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
  const marker = `<!-- unlighthouse-${provider}-report -->`;

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
  });

  const existing = comments.find(c => c.body.includes(marker));

  // Only open a new comment for failures, but keep an existing one current so
  // it shows when the regression is fixed.
  if (!failed && !existing) return;

  const report = failed
    ? fs.readFileSync(reportPath, 'utf-8')
    : '## Unlighthouse Comparison\n\n✅ Resolved: the latest run found no regressions.\n';
  const body = marker + '\n' + report + `\n[Full Unlighthouse report →](${runUrl})\n`;

  if (existing) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existing.id,
      body,
    });
  } else {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      body,
    });
  }
};
