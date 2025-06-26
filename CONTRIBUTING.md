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

### Pulling updates from `canary` into `integrations/makeswift`

We aim to keep `integrations/makeswift` in sync with `canary`. To do this, we frequently pull the latest code from `canary` into `integrations/makeswift`.

To pull the latest code from `canary` into `integrations/makeswift`, you can follow these steps:

1. Fetch the latest code from `canary`:

   ```bash
   git checkout canary
   git pull
   ```

2. Fetch the latest code from `integrations/makeswift`:

   ```bash
   git checkout integrations/makeswift
   git pull
   ```

3. Checkout a new branch from `integrations/makeswift`:

   ```bash
   git checkout -b {new-branch-name}
   ```

4. Merge `canary` into the new branch:

   ```bash
   git merge canary
   ```

5. After resolving any merge conflicts, open a new PR in GitHub to merge your new branch into `integrations/makeswift`. This PR should be code reviewed and approved before the next steps.

6. Rebase the changes onto the local `integrations/makeswift` branch in order to make the branches 1-1 and keep a linear commit history.

   ```bash
   git checkout integrations/makeswift
   git rebase {new-branch-name}
   ```

7. Push the changes up to GitHub, which will automatically close the open PR from step 6.
   ```bash
   git push
   ```

## Other Ways to Contribute

- Consider reporting bugs, contributing to test coverage, or helping spread the word about Catalyst.

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference pull requests and external links liberally

Thank you again for your interest in contributing to Catalyst!
