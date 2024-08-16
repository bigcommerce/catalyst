module.exports = async ({ github, context, core }) => {
    const result = await github.rest.repos.listPullRequestsAssociatedWithCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: context.sha,
    });

    core.setOutput('pr', result?.data[0]?.number || '');
    core.setOutput('title', result?.data[0]?.title || '');
    core.setOutput('url', result?.data[0]?.html_url || '');
    core.setOutput('draft', `${result?.data[0]?.draft}` || 'true');
}
