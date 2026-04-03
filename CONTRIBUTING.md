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

- You have a remote named `origin` pointing to the [`bigcommerce/catalyst` repository on GitHub](https://github.com/bigcommerce/catalyst).
- You have rights to push to the `integrations/makeswift` branch on GitHub.

#### Steps

1. Fetch latest from `origin`

   ```bash
   git fetch origin
   ```

2. Create a branch to perform a merge from `canary`

   ```bash
   git checkout -B sync-integrations-makeswift origin/integrations/makeswift
   ```

> [!TIP]
> The `-B` flag means "create branch or reset existing branch":
>
> - If the local branch doesn't exist, it creates it from `origin/integrations/makeswift`
> - If the local branch exists, it resets it to match `origin/integrations/makeswift`

3. Merge `canary` and resolve merge conflicts, if necessary:

   ```bash
   git merge canary
   ```

> [!WARNING]
> **Gotchas when merging canary into integrations/makeswift:**
>
> - The `name` field in `core/package.json` should remain `@bigcommerce/catalyst-makeswift`
> - The `version` field in `core/package.json` should remain whatever the latest published `@bigcommerce/catalyst-makeswift` version was

4. After resolving any merge conflicts, open a new PR in GitHub to merge your `sync-integrations-makeswift` into `integrations/makeswift`. This PR should be code reviewed and approved before the next steps.

5. Rebase `integrations/makeswift` to establish new merge base

   ```bash
   git checkout -B integrations/makeswift origin/integrations/makeswift
   git rebase sync-integrations-makeswift
   ```

6. Push the changes up to GitHub:

   ```bash
   git push origin integrations/makeswift
   ```

This should close the PR in GitHub automatically.

> [!IMPORTANT]
> Do not squash or rebase-and-merge PRs into `integrations/makeswift`. Always use a true merge commit or rebase locally (as shown below). This is to preserve the merge commit and establish a new merge base between `canary` and `integrations/makeswift`.

## Cutting New Releases

Catalyst uses [Changesets](https://github.com/changesets/changesets) to manage version bumps, changelogs, and publishing. Releases happen in **two stages**:

1. Cut a release from `canary`
2. Sync that release into `integrations/makeswift` and cut again

This ensures `integrations/makeswift` remains a faithful mirror of `canary` while including its additional integration code.

#### Stage 1: Cut a release from `canary`

1. Begin the release process by merging the **Version Packages (`canary`)** PR. When `.changeset/` files exist on `canary`, a GitHub Action opens a **Version Packages (`canary`)** PR. This PR consolidates pending changesets, bumps versions, and updates changelogs. Merging this PR should publish new tags to GitHub, and optionally publish new package versions to NPM.

#### Stage 2: Sync and Release `integrations/makeswift`

2. Follow steps 1-6 under "[Keeping `integrations/makeswift` in sync with `canary`](#keeping-integrationsmakeswift-in-sync-with-canary)"

3. **IMPORTANT**: After step 6, you'll need to open another PR into `integrations/makeswift`
   - Ensure a local `integrations/makeswift` branch exists and is up to date (`git checkout -B integrations/makeswift origin/integrations/makeswift`)
   - Run `git fetch origin` and create a new branch from `integrations/makeswift` (`git checkout -B bump-version origin/integrations/makeswift`)
   - From this new `bump-version` branch, run `pnpm changeset`
   - Select `@bigcommerce/catalyst-makeswift`
   - For choosing between a `patch/minor/major` bump, you should copy the bump from Stage 1. (e.g., if `@bigcommerce/catalyst-core` went from `1.1.0` to `1.2.0`, choose `minor`)
   - Commit the generated changeset file and open a PR to merge this branch into `integrations/makeswift`
   - Once merged, you can proceed to the next step

4. Merge the **Version Packages (`integrations/makeswift`)** PR: Changesets will open another PR (similar to Stage 1) bumping `@bigcommerce/catalyst-makeswift`. Merge it following the same process. This cuts a new release of the Makeswift variant.

### Additional Notes

- **Tags and Releases:** Confirm tags exist for both `@bigcommerce/catalyst-core` and `@bigcommerce/catalyst-makeswift`. If needed, update `latest` tags in GitHub manually.
- **Release cadence:** Teams typically review on Wednesdays whether to cut a release, but you may cut releases more frequently as needed.

## Other Ways to Contribute

- Consider reporting bugs, contributing to test coverage, or helping spread the word about Catalyst.

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference pull requests and external links liberally

Thank you again for your interest in contributing to Catalyst!
