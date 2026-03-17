---
name: release-catalyst
description: >
  Cut a new release of Catalyst (`@bigcommerce/catalyst-core` and `@bigcommerce/catalyst-makeswift`).
  Use when the user says "/release-catalyst", "cut a release", "release catalyst", or asks to
  publish new versions of the Catalyst packages. This skill orchestrates the full two-stage release
  process: merging the Version Packages PR on canary, syncing integrations/makeswift, and pushing
  @latest tags.
---

# Release Catalyst

Execute stages in order. Pause for user input where indicated.

## Stage 1: Cut release from `canary`

### 1a. Find and merge the Version Packages PR

```bash
gh pr list --search "Version Packages (canary)" --state open --json number,title,reviews,mergeable
```

- If **no open PR** exists, inform the user that there are no pending changesets on `canary` and stop.
- If the PR is **approved and checks are passing**, merge it: `gh pr merge <number> --squash`
- If the PR is **not approved or checks are not passing**, tell the user and wait.
  - Bot-opened PRs often don't trigger CI. If checks aren't running, push an empty commit to trigger them:
    ```bash
    git checkout --track origin/changeset-release/canary
    git commit --allow-empty -m "chore: trigger CI"
    git push origin changeset-release/canary
    git checkout canary && git branch -D changeset-release/canary
    ```
  - **Stop here.** Wait for the user to confirm checks pass and the PR is approved before merging.

### 1b. Verify the release

After the PR merges:

```bash
git fetch origin --tags
```

Determine the new `@bigcommerce/catalyst-core` version from the PR body (look for `## @bigcommerce/catalyst-core@X.Y.Z`). Then verify:

```bash
gh release view @bigcommerce/catalyst-core@<version> --json tagName,name,isDraft,isPrerelease
```

If the release and tag don't exist yet, wait briefly and retry — the Changesets action may still be running.

Record the **version number** and **bump type** (patch/minor/major) for use in Stage 2.

## Stage 2: Sync and release `integrations/makeswift`

### 2a. Sync branches

Invoke the `/sync-makeswift` skill, with one addition: during the sync (after merge, before pushing), also add a changeset for `@bigcommerce/catalyst-makeswift`:

**Determine bump type**: Match the bump type from Stage 1 (e.g., if core went `1.4.2` → `1.5.0`, that's a `minor`).

**Create changeset file** (`.changeset/sync-canary-<version>.md`, where `<version>` uses hyphens instead of dots — e.g., `1.6.0` → `sync-canary-1-6-0.md`). Changeset filenames only allow lowercase letters and hyphens; dots are invalid.

```markdown
---
"@bigcommerce/catalyst-makeswift": <patch|minor|major>
---

Pulls in changes from the `@bigcommerce/catalyst-core@<version>` release. For more information about what was included in the `@bigcommerce/catalyst-core@<version>` release, see the [changelog entry](https://github.com/bigcommerce/catalyst/blob/<canary-sha>/core/CHANGELOG.md#<version-anchor>).
```

Where:
- `<canary-sha>` is the merge commit SHA on canary (from the Version Packages merge)
- `<version-anchor>` is the version with dots removed (e.g., `1.5.0` → `150`)

Include this changeset in the merge commit (amend if needed) alongside the normal sync work.

### 2b. Merge the Version Packages (`integrations/makeswift`) PR

After the sync lands, the Changesets action will open a "Version Packages (`integrations/makeswift`)" PR.

```bash
gh pr list --search "Version Packages (integrations/makeswift)" --state open --json number,title
```

Same flow as Stage 1a:
- If checks aren't running (bot PR), push an empty commit to trigger CI, then **drop it before merging** by resetting to the parent and force-pushing.
- Once approved and green, merge with `gh pr merge <number> --squash`.
  - Note: squash merging is normally disallowed on `integrations/makeswift` to preserve merge bases for sync PRs. The user may need to temporarily enable squash merging in the branch protection rules for this step, then re-disable it after.

### 2c. Verify the makeswift release

```bash
git fetch origin --tags
gh release view @bigcommerce/catalyst-makeswift@<version> --json tagName,name,isDraft,isPrerelease
```

## Stage 3: Push `@latest` tags

Update both `@latest` tags to point to the new releases:

```bash
git fetch origin --tags
git tag @bigcommerce/catalyst-core@latest @bigcommerce/catalyst-core@<version> -f
git tag @bigcommerce/catalyst-makeswift@latest @bigcommerce/catalyst-makeswift@<version> -f
git push origin @bigcommerce/catalyst-core@latest -f
git push origin @bigcommerce/catalyst-makeswift@latest -f
```

Confirm both tags were pushed successfully.

## Stage 4: Cleanup

```bash
git checkout canary
git pull
```

Delete any leftover local branches (`changeset-release/*`, `sync-integrations-makeswift`, `integrations/makeswift`).

Report the final state: both package versions released, tags updated, branches cleaned up.
