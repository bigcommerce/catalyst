module.exports = async ({ github, context, core }) => {
    const exemptPaths = [
        'docs/',
        'integrations/',
        'packages/create-catalyst/',
        'packages/eslint-config-catalyst/'
    ];

    const result = await github.rest.repos.listPullRequestsAssociatedWithCommit({
        owner: context.repo.owner,
        repo: context.repo.repo,
        commit_sha: context.sha,
    });

    const { data: files } = await github.rest.pulls.listFiles({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: result?.data[0]?.number,
    });

    const changedFiles = files.map(f => f.filename);
    const nonExemptFiles = changedFiles.filter(f => {
        return !exemptPaths.some(path => f.startsWith(path));
    });

    let runJob = true;
    if (nonExemptFiles.length === 0) {
        runJob = false;
    }

    core.setOutput('pr', result?.data[0]?.number || '');
    core.setOutput('title', result?.data[0]?.title || '');
    core.setOutput('url', result?.data[0]?.html_url || '');
    core.setOutput('draft', `${result?.data[0]?.draft}` || 'true');
    core.setOutput('run_job', runJob.toString());
}
