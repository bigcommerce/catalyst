---
name: release-catalyst
description: >
  Cut a new release of Catalyst (`@bigcommerce/catalyst-core`, `@bigcommerce/catalyst-makeswift`,
  and `@bigcommerce/catalyst-b2b-makeswift`).
  Use when the user says "/release-catalyst", "cut a release", "release catalyst", or asks to
  publish new versions of the Catalyst packages. This skill orchestrates the full release process:
  merging the Version Packages PR on canary, syncing and releasing integrations/makeswift, then
  integrations/b2b-makeswift, and pushing @latest tags.
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

Invoke the `/sync-integration-branch` skill with target `integrations/makeswift`, with one addition: during the sync (after merge, before pushing), also add a changeset for `@bigcommerce/catalyst-makeswift`:

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

## Stage 3: Sync and release `integrations/b2b-makeswift`

`integrations/b2b-makeswift` builds on `integrations/makeswift`, so it releases after Stage 2. If Stage 2 didn't cut a new makeswift release (no makeswift changes), skip this stage.

### 3a. Sync branches

Invoke the `/sync-integration-branch` skill with target `integrations/b2b-makeswift`, with one addition: during the sync (after merge, before pushing), also add a changeset for `@bigcommerce/catalyst-b2b-makeswift`:

**Determine bump type**: Match the bump type from Stage 2 (the makeswift bump).

**Create changeset file** (`.changeset/sync-makeswift-<version>.md`, where `<version>` uses hyphens instead of dots):

```markdown
---
"@bigcommerce/catalyst-b2b-makeswift": <patch|minor|major>
---

Pulls in changes from the `@bigcommerce/catalyst-makeswift@<version>` release. For more information, see the [changelog entry](https://github.com/bigcommerce/catalyst/blob/<makeswift-sha>/core/CHANGELOG.md#<version-anchor>).
```

Where `<version>` is the makeswift version released in Stage 2, `<makeswift-sha>` is the Version Packages merge commit on `integrations/makeswift`, and `<version-anchor>` is that version with dots removed. The b2b package keeps its **own** version line: the bump type mirrors makeswift's, but the resulting `@bigcommerce/catalyst-b2b-makeswift` version number is independent of makeswift's.

Include this changeset in the merge commit (amend if needed) alongside the normal sync work.

### 3b. Merge the Version Packages (`integrations/b2b-makeswift`) PR

After the sync lands, the Changesets action opens a "Version Packages (`integrations/b2b-makeswift`)" PR.

```bash
gh pr list --search "Version Packages (integrations/b2b-makeswift)" --state open --json number,title
```

Same flow as Stage 2b:
- If checks aren't running (bot PR), push an empty commit to trigger CI, then **drop it before merging** by resetting to the parent and force-pushing.
- Once approved and green, merge with `gh pr merge <number> --squash`.
  - Same caveat as makeswift: squash merging is normally disallowed on `integrations/b2b-makeswift` to preserve merge bases for sync PRs. Temporarily enable it for this step, then re-disable.

### 3c. Verify the b2b release

```bash
git fetch origin --tags
gh release view @bigcommerce/catalyst-b2b-makeswift@<version> --json tagName,name,isDraft,isPrerelease
```

> **Large catch-up:** when reviving a branch that's many makeswift releases behind, run this stage once per makeswift **minor** tag (see the one-time catch-up in `/sync-integration-branch`), cutting a b2b release per rung so `@latest` marches forward cleanly.

## Stage 4: Push `@latest` tags

Update the `@latest` tags to point to the new releases (skip any package that didn't get a new release this run):

```bash
git fetch origin --tags
git tag @bigcommerce/catalyst-core@latest @bigcommerce/catalyst-core@<core-version> -f
git tag @bigcommerce/catalyst-makeswift@latest @bigcommerce/catalyst-makeswift@<makeswift-version> -f
git tag @bigcommerce/catalyst-b2b-makeswift@latest @bigcommerce/catalyst-b2b-makeswift@<b2b-version> -f
git push origin @bigcommerce/catalyst-core@latest -f
git push origin @bigcommerce/catalyst-makeswift@latest -f
git push origin @bigcommerce/catalyst-b2b-makeswift@latest -f
```

Confirm the tags were pushed successfully.

## Stage 5: Cleanup

```bash
git checkout canary
git pull
```

Delete any leftover local branches (`changeset-release/*`, `sync-integrations-makeswift`, `integrations/makeswift`, `sync-integrations-b2b-makeswift`, `integrations/b2b-makeswift`).

Report the final state: which package versions released, tags updated, branches cleaned up.
