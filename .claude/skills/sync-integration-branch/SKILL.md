---
name: sync-integration-branch
description: >
  Sync a Catalyst integration branch (`integrations/*`) with its upstream branch in the monorepo.
  Use when the user says "/sync-integration-branch", "sync makeswift", "sync integrations/makeswift",
  "sync b2b-makeswift", "sync integrations/b2b-makeswift", or asks to bring an `integrations/*` branch
  up to date with its upstream. The target integration branch is passed as the argument.
---

# Sync an integration branch with its upstream

Catalyst maintains a chain of integration branches, each layered on the one before it. `canary` is the root; every `integrations/*` branch mirrors an upstream branch and adds its own integration code on top. This skill syncs one **target** integration branch with its **upstream**, while defending the target's package identity, its release wiring, and its integration-specific code.

The generic flow lives below. Everything branch-specific (upstream, package identity, integration surface, and any branch-only caveats) lives in a per-branch **reference file** that Phase 0 loads once the target is resolved.

## Supported branches

| Target branch | Reference |
|---|---|
| `integrations/makeswift` | `references/makeswift.md` |
| `integrations/b2b-makeswift` | `references/b2b-makeswift.md` |

**Sync top-down.** When several branches need syncing, do the upstream first (`integrations/makeswift` before `integrations/b2b-makeswift`) so a branch never trails its upstream by more than one release.

## Phase 0: Resolve the target branch and load its reference

The skill argument is the target integration branch. Accept either the full ref (`integrations/b2b-makeswift`) or a shorthand (`b2b-makeswift`, `makeswift`).

1. If **no argument** was given, list the Supported branches above and ask the user which one to sync. **Stop** and wait.
2. Normalize the argument to a full ref (prepend `integrations/` if a shorthand omitted it).
3. Validate the resolved branch is **both** in the Supported branches table **and** present on origin:

   ```bash
   git fetch origin
   git ls-remote --heads origin <target>
   ```

   If the branch is not in the table, or `git ls-remote` prints nothing, report that it is not a valid integration branch, list the supported `integrations/*` targets, and ask the user to pick a valid one. **Stop.**
4. **Read the matching `references/<name>.md`** for the resolved target and hold its values for the rest of the run: **upstream**, **package identity**, **sync branch**, **merge-base pair**, **integration surface**, and any **branch-specific notes**. The placeholders below (`<upstream>`, `<package identity>`, `<sync-branch>`, `<target>`) are filled from that file.

## Phase 1: Prepare and merge

```bash
git checkout -B <sync-branch> origin/<target>
git merge origin/<upstream>
```

If the merge completes cleanly, skip to changeset cleanup. Otherwise, resolve conflicts.

### Conflict resolution rules

Keep the target branch's identity, its release-wiring overrides, and its integration surface; take the upstream's structure for everything else. Never let an upstream value overwrite one of these — in particular, a package-name regression would republish over the upstream's package.

- **`core/package.json` name/version** — the `name` field MUST stay `<package identity>`. The `version` field MUST stay at the latest published `<package identity>` version (check what's on `origin/<target>`, not `origin/<upstream>`).
- **`core/package.json` nested `catalyst.version`/`catalyst.ref`** — check these even when they don't show up as a textual conflict. They must mirror the top-level `name`/`version` on this branch (e.g. `"version": "1.9.0"` → `catalyst.ref: "<package identity>@1.9.0"`), matching what the automated "Version Packages (`<target>`)" bump sets them to. Because this is a small, self-contained hunk, git often merges it cleanly by taking the upstream's raw value without flagging a conflict — check it by hand every time:

  ```bash
  grep -A3 '"catalyst"' core/package.json
  ```

- **`core/CHANGELOG.md`** — the latest release entry MUST match the latest published `<package identity>` version.
- **`.changeset/config.json`** — keep `baseBranch` pointed at `<target>` (never let the upstream's `baseBranch` win) and keep the branch's own `ignore` list.
- **`.github/workflows/prevent-invalid-changesets.yml` + `.github/scripts/prevent-invalid-changesets.js`** — keep them targeting `<target>` and allowing only `<package identity>`. Never let the upstream's target/package win.
- **`.github/workflows/changesets-release.yml`** — shared, ref-driven infrastructure (per-branch behavior is keyed on `github.ref_name`), so take the upstream's copy as-is; no per-branch edit is needed here.
- **`pnpm-lock.yaml`** — accept the upstream's version (`git checkout --theirs pnpm-lock.yaml`), then regenerate with `pnpm install --no-frozen-lockfile`.
- **Integration surface** — preserve the target's integration surface (from its reference file) wholesale.
- Apply any **branch-specific rules** called out in the loaded reference file.
- For all other conflicts, prefer the upstream's structure/patterns while preserving the integration surface above.

After resolving all conflicts, stage everything and verify no unresolved conflicts remain:

```bash
git add <resolved files>
git diff --name-only --diff-filter=U  # should return empty
```

### Changeset cleanup

Remove any `.changeset/*.md` files that do NOT target `<package identity>`. Read each changeset file and delete any that reference other packages (`@bigcommerce/catalyst-core`, the upstream package, etc.). Amend the removals into the merge commit. (The `prevent-invalid-changesets` GitHub Action enforces this on the PR.)

### Commit the merge

```bash
git commit --no-edit
```

If changesets were removed after the initial commit, amend them in (`git commit --amend --no-edit`) rather than creating a separate commit.

## Phase 2: Push and open PR

```bash
git push origin <sync-branch>
```

Open a PR into `<target>` (never into the upstream or `canary`):

- Title: `sync \`<target>\` with \`<upstream>\``
- Body: summarize what came from the upstream, list conflict resolutions, and include this notice:

> **Do not squash or rebase-and-merge this PR.** Use a true merge commit or rebase locally to preserve the merge base between `<upstream>` and `<target>`.

**Stop here.** Tell the user the PR is ready for review and wait for them to confirm approval before continuing.

## Phase 3: Rebase and push (after PR approval)

```bash
git fetch origin
git checkout -B <target> origin/<target>
git rebase <sync-branch>
git push origin <target> --force-with-lease
```

This closes the PR automatically. Confirm with the user that the push succeeded and the PR closed.

## Phase 4: Cleanup

Switch back to `canary` and delete the local branches that are no longer needed:

```bash
git checkout canary
git pull
git branch -D <sync-branch> <target>
```

## One-time catch-up (large version gaps)

When a target branch is many releases behind its upstream (e.g. reviving a stalled branch), do NOT merge `origin/<upstream>` in one shot. Instead merge the upstream package's published version tags one at a time — **minor tags only** (e.g. `@bigcommerce/catalyst-makeswift@1.7.0` → `@1.8.0` → `@1.9.0`); skip the intervening patch releases, since each minor tag already contains them:

```bash
git merge <upstream-package>@<minor-version>
```

Apply the same conflict rules at each step so a broken step is bisectable to a single minor. Once caught up, resume steady-state syncs that merge `origin/<upstream>` directly.
