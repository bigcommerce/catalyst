# Contributing to Catalyst

Thanks for showing interest in contributing!

The following is a set of guidelines for contributing to Catalyst. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Repository Structure

Catalyst is a monorepo that contains the code for the Catalyst Next.js application inside of `core/`, and supporting packages such as the GraphQL API client and the `create-catalyst` CLI in `packages/`.

The default branch for this repository is called `canary`. This is the primary development branch where active development takes place, including the introduction of new features, bug fixes, and other changes before they are released in stable versions.

To contribute to the `canary` branch, you can create a new branch off of `canary` and submit a PR against that branch.

## Makeswift Integration

In addition to `canary`, we also maintain the `integrations/makeswift` branch, which contains additional code required to integrate with [Makeswift](https://www.makeswift.com).

To contribute to the `integrations/makeswift` branch, you can create a new branch off of `integrations/makeswift` and submit a PR against that branch.

### Keeping `integrations/makeswift` in sync with `canary`

Except for the additional code required to integrate with Makeswift, the `integrations/makeswift` branch is a mirror of the `canary` branch. This means that the `integrations/makeswift` branch should be kept in sync with the `canary` branch as much as possible.

#### Prerequisites

In order to complete the following steps, you will need to have met the following prerequisites:

- You have a remote named `origin` pointing to the [`bigcommerce/catalyst` repository on GitHub](https://github.com/bigcommerce/catalyst). If you do not, you can add it with `git remote add origin ssh://git@github.com/bigcommerce/catalyst.git`, or if you are not using SSH, you can use `git remote add origin https://github.com/bigcommerce/catalyst.git`.
- You have rights to push to the `integrations/makeswift` branch on GitHub.

#### Steps

To pull the latest code from `canary` into `integrations/makeswift`, follow the steps below:

1. Ensure your local `canary` branch is synchronized with the remote `canary` branch:

   ```bash
   git fetch origin
   git checkout canary
   git reset --hard origin/canary
   ```

2. Fetch the latest code from `integrations/makeswift`:

   ```bash
   git checkout -B integrations/makeswift origin/integrations/makeswift
   ```

> [!TIP]
> The `-B` flag means "create branch or reset existing branch":
>
> - If the local branch doesn't exist, it creates it from `origin/integrations/makeswift`
> - If the local branch exists, it resets it to match `origin/integrations/makeswift`

3. Checkout a new branch from `integrations/makeswift`:

   ```bash
   git checkout -b {new-branch-name}
   ```

4. Merge `canary` into `{new-branch-name}`, and resolve merge conflicts, if necessary:

   ```bash
   git merge canary
   ```

> [!WARNING]
> There are a number of "gotchas" that you need to be aware of when merging `canary` into `integrations/makeswift`:
>
> - The `name` field in `core/package.json` should remain `@bigcommerce/catalyst-makeswift`
> - The `version` field in `core/package.json` should remain whatever the latest published `@bigcommerce/catalyst-makeswift` version was
> - The `.changesets/` directory should not include any files that reference the `"@bigcommerce/catalyst-core"` package. If these files are merged into `integrations/makeswift`, they will cause the `Changesets Release` GitHub Action in `.github/workflows/changesets-release.yml` to fail with the error: `Error: Found changeset for package @bigcommerce/catalyst-core which is not in the workspace`

<!-- TODO: The chances of someone accidentally merging a PR that references the `@bigcommerce/catalyst-core` package are quite high. We should find a better way to prevent this from happening. -->

5. After resolving any merge conflicts, open a new PR in GitHub to merge your `{new-branch-name}` into `integrations/makeswift`. This PR should be code reviewed and approved before the next steps.

6. Once your PR is approved, the next step is to incorporate the merge commit from `{new-branch-name}` into `integrations/makeswift`. Do not use the merge button in the GitHub UI to merge your PR. Instead, you'll want to run the following command locally:

   ```bash
   git checkout integrations/makeswift
   git rebase {new-branch-name}
   ```

> [!IMPORTANT]
> It is very important that you do not use the merge button in the GitHub UI to merge your PR. The problem with the "Squash and merge" or "Rebase and merge" button in GitHub is that it **rewrites history and throws away your local merge commit**. Instead, locally rebasing your `integrations/makeswift` branch onto your `{new-branch-name}` branch preserves the merge commit from step 4, which will properly set the new merge base for future merges from `canary` into `integrations/makeswift`.

7. Push the changes up to GitHub, which will automatically close the open PR from step 5.

   ```bash
   git push origin integrations/makeswift
   ```

## Cutting new releases

This repository uses [Changesets](https://github.com/changesets/changesets) to manage version bumps, changelogs, and publishing to the NPM registry. Whenever you create a pull request, you should think about whether the changes you are making warrant a version bump or a changelog entry.

If you are not sure, you can ask in the PR. Here are some examples:

- If your pull request introduces changes to the root `README.md`: _Likely does not warrant a version bump or changelog entry, therefore your PR does not need to include a Changeset._
- If your pull request introduces changes to `core/`, e.g., `core/app/`, or any of the packages in `packages/`: _Likely warrants a version bump and changelog entry, therefore your PR should include a Changeset._

You can run the following command to create a new version bump and changelog entry:

```bash
pnpm changeset
```

An interactive prompt will take you through the process of [adding your changeset](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md).

Once you've completed the interactive prompt, you'll see a new file in the `.changesets/` directory. This file contains the version bump and changelog entry for your changes. You should commit this file to the branch associated with your PR.

Once your PR is merged, our [GitHub Action](.github/workflows/changesets-release.yml) will handle the process of versioning and updating the changelog, (and in the case of `packages/`, publishing your changes to NPM). No further action is needed from you.

> [!WARNING]
> It is very important that `.changeset/*.md` files targeting packages in `packages/` are not merged into the `integrations/makeswift` branch. While it is technically feasible to release packages from `integrations/makeswift`, we never want to do this. If we did this, we would need to sync the branches in the opposite direction, which was never intended to happen.

## Other Ways to Contribute

- Consider reporting bugs, contributing to test coverage, or helping spread the word about Catalyst.

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference pull requests and external links liberally

Thank you again for your interest in contributing to Catalyst!
