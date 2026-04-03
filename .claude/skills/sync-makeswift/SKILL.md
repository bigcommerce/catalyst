---
name: sync-makeswift
description: >
  Sync the `integrations/makeswift` branch with `canary` in the Catalyst monorepo.
  Use when the user says "/sync-makeswift", "sync makeswift", "sync integrations/makeswift",
  or asks to bring `integrations/makeswift` up to date with `canary`.
---

# Sync `integrations/makeswift` with `canary`

Execute the following phases in order. Pause for user input where indicated.

## Phase 1: Prepare and merge

```bash
git fetch origin
git checkout -B sync-integrations-makeswift origin/integrations/makeswift
git merge origin/canary
```

If the merge completes cleanly, skip to changeset cleanup. Otherwise, resolve conflicts.

### Conflict resolution rules

- `core/package.json`: the `name` field MUST stay `@bigcommerce/catalyst-makeswift`. The `version` field MUST stay at the latest published `@bigcommerce/catalyst-makeswift` version (check what's on `origin/integrations/makeswift`, not `canary`).
- `core/CHANGELOG.md`: the latest release entry MUST match the latest published `@bigcommerce/catalyst-makeswift` version.
- `pnpm-lock.yaml`: accept canary's version (`git checkout --theirs pnpm-lock.yaml`), then regenerate with `pnpm install --no-frozen-lockfile`.
- For all other conflicts, prefer canary's structure/patterns while preserving makeswift-specific additions (imports, components, config).

After resolving all conflicts, stage everything and verify no unresolved conflicts remain:

```bash
git add <resolved files>
git diff --name-only --diff-filter=U  # should return empty
```

### Changeset cleanup

Remove any `.changeset/*.md` files that do NOT target `@bigcommerce/catalyst-makeswift`. Read each changeset file and delete any that reference `@bigcommerce/catalyst-core` or other packages. Amend the removals into the merge commit.

### Commit the merge

```bash
git commit --no-edit
```

If changesets were removed after the initial commit, amend them in (`git commit --amend --no-edit`) rather than creating a separate commit.

## Phase 2: Push and open PR

```bash
git push origin sync-integrations-makeswift
```

Open a PR into `integrations/makeswift` (not `canary`):

- Title: `sync \`integrations/makeswift\` with \`canary\``
- Body: summarize what came from canary, list conflict resolutions, and include this notice:

> **Do not squash or rebase-and-merge this PR.** Use a true merge commit or rebase locally to preserve the merge base between `canary` and `integrations/makeswift`.

**Stop here.** Tell the user the PR is ready for review and wait for them to confirm approval before continuing.

## Phase 3: Rebase and push (after PR approval)

```bash
git fetch origin
git checkout -B integrations/makeswift origin/integrations/makeswift
git rebase sync-integrations-makeswift
git push origin integrations/makeswift --force-with-lease
```

This closes the PR automatically. Confirm with the user that the push succeeded and the PR closed.

## Phase 4: Cleanup

Switch back to `canary` and delete the local branches that are no longer needed:

```bash
git checkout canary
git pull
git branch -D sync-integrations-makeswift integrations/makeswift
```
