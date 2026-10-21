const fs = require('fs');

// Comments only when the PR is over budget; within budget, the report lives in
// the job summary and any earlier comment is removed so it can't go stale.
module.exports = async ({ github, context, overBudget, reportPath = '/tmp/bundle-report.md' }) => {
  const marker = '<!-- bundle-size-report -->';

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    per_page: 100,
  });

  const existing = comments.find(c => c.body.includes(marker));

  if (!overBudget) {
    if (existing) {
      await github.rest.issues.deleteComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: existing.id,
      });
    }

    return;
  }

  const body = marker + '\n' + fs.readFileSync(reportPath, 'utf-8');

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
      issue_number: context.issue.number,
      body,
    });
  }
};
