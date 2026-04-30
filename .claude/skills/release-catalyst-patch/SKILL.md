---
name: release-catalyst-patch
description: >
  Release a single Catalyst package patch in isolation, without bundling it with
  other queued changesets in the open Version Packages PR. Use when the user says
  "/release-catalyst-patch", "isolate a patch release", "publish only one package",
  or wants to ship a single package's changeset ahead of the normal release cadence.
  Performs the full flow locally (`changeset version`, build, `changeset publish`,
  push, GitHub release) so the remaining queued changesets stay untouched in the
  Version Packages PR.
---

# Release Catalyst Patch (single-package isolation)

The Changesets GitHub Action picks one mode per push to `canary`: if any unconsumed
changesets exist, it opens/refreshes the Version Packages PR and **does not** publish.
That's why we publish locally — we keep the other changesets in `.changeset/` so the
Version Packages PR still tracks them, but we ship just the one we want now.

Execute stages in order. Pause for user input where indicated. **Never execute the
`changeset publish` command yourself** — provide it to the user to run.

## Stage 0: Confirm scope

Identify the changeset to release and the target package + version.

```bash
ls .changeset/
git log --oneline -10                       # find the PR/commit that added the changeset
cat .changeset/<changeset-file>.md          # confirm the package + bump type
npm view <package> version dist-tags        # confirm current published state
```

Confirm with the user:
- Which `.changeset/*.md` file is being released
- The target package and the resulting version (e.g., `1.0.2` → `1.0.3`)
- That **all other** changesets in `.changeset/` should remain queued for the next regular release

If the package has notes in the [Package-specific notes](#package-specific-notes) section
below, review them before continuing.

## Stage 1: Branch + quarantine

Work on a release branch so the workflow doesn't trigger mid-flow.

```bash
git switch canary && git pull
git switch -c release/<package>-<new-version>
```

Move the **other** changesets **outside** the repo. A subdirectory inside `.changeset/`
gets parsed as a malformed changeset by the CLI and crashes `changeset version`:

```bash
mkdir -p /tmp/changeset-hold
mv .changeset/<other-1>.md .changeset/<other-2>.md ... /tmp/changeset-hold/
ls .changeset/   # should leave only config.json + the one changeset to release
```

## Stage 2: Run `changeset version`

Requires `GITHUB_TOKEN` because the repo uses `@changesets/changelog-github`. The `gh`
CLI token works.

```bash
pnpm install --frozen-lockfile
GITHUB_TOKEN=$(gh auth token) pnpm changeset version
```

Restore the held changesets immediately:

```bash
mv /tmp/changeset-hold/*.md .changeset/
rmdir /tmp/changeset-hold
```

Verify the diff:

```bash
git status
git diff packages/<package>/package.json packages/<package>/CHANGELOG.md
```

Expect: bumped `package.json`, new CHANGELOG entry, deleted only the one changeset.
The other changesets should be back in `.changeset/` and untouched.

## Stage 3: Build

Run the root build. Turborepo handles env passthrough from `.env.local` via the
pipeline config, so package builds get the variables they need without manual sourcing.

```bash
pnpm build
```

If a package has build-time secrets that must be present, see the
[Package-specific notes](#package-specific-notes) section for verification steps.

## Stage 4: Commit

```bash
git add -A
git commit -m "Version Packages (\`canary\`)"
```

Match the message format the changesets bot uses, since this is a manual stand-in for it.

## Stage 5: Hand the publish command to the user

**Do not run `changeset publish` from the agent.** Publishing to npm is a destructive,
externally-visible action that should be performed by the user.

Have the user confirm they're logged in, then run the publish themselves. The CLI will
prompt them interactively for the npm OTP.

```bash
npm whoami                       # expect their npm username
pnpm exec changeset publish      # prompts for OTP interactively
```

`changeset publish` is per-package version-aware: it only publishes packages whose local
`package.json` is ahead of npm. Since only one package was bumped, only it ships. It
also creates a local git tag like `@bigcommerce/<package>@<version>`.

Wait for the user to confirm the publish completed before continuing.

## Stage 6: Verify npm state

```bash
npm view <package> version
npm view <package> dist-tags
```

`latest` should point to the new version. If it doesn't (rare — only happens if
`publishConfig.tag` is set), advise the user to fix with:

```bash
npm dist-tag add <package>@<version> latest
```

## Stage 7: Fast-forward canary and push

This requires a direct push to the protected default branch. **Pause and ask for explicit
user authorization** before pushing — the user's "never push directly to main/master/production"
rule guards against this even though the changesets bot does the same thing during normal
releases.

```bash
git switch canary
git fetch origin canary
git log --oneline origin/canary..canary    # should be 1 ahead
git log --oneline canary..origin/canary    # should be 0 behind
git merge --ff-only release/<package>-<new-version>
```

If you're 1 ahead and 0 behind, default `git push` rejects non-fast-forward updates,
which gives the same safety as `--ff-only` on the push side. Apple's git build (≤2.50.x)
does not accept `--ff-only` as a push flag — `git push origin canary` is correct here.

If a hook blocks the agent push, hand these commands to the user:

```bash
git push origin canary
git push origin "@bigcommerce/<package>@<new-version>"
```

## Stage 8: Create the GitHub release manually

CI runs `changeset publish` after the canary push, finds the version already on npm,
and no-ops. Because the action only creates GitHub releases for packages it actually
publishes, **no release is created automatically** in this flow. Make it manually.

Extract the new CHANGELOG section (everything after the `## <version>` heading up to
the next `## ` heading) into a notes file. Then:

```bash
gh release create "@bigcommerce/<package>@<new-version>" \
  --repo bigcommerce/catalyst \
  --title "@bigcommerce/<package>@<new-version>" \
  --notes-file /tmp/release-notes.md
```

Match the body format of prior releases — just the `### Patch Changes` /
`### Minor Changes` heading and the bullets, no version heading at the top. Compare
against an existing release:

```bash
gh release view "@bigcommerce/catalyst-core@<some-prior-version>" --repo bigcommerce/catalyst --json body
```

## Stage 9: Final validation

```bash
git fetch origin canary
git log --oneline origin/canary -3                                              # version commit on canary
git ls-remote --tags origin "@bigcommerce/<package>@<new-version>"              # tag on origin
gh release view "@bigcommerce/<package>@<new-version>" --repo bigcommerce/catalyst --json tagName,isDraft,isPrerelease
gh run list --workflow=changesets-release.yml --limit 1                         # CI run succeeded
gh pr list --search "Version Packages (canary)" --state open --json number,headRefName,updatedAt   # Version Packages PR refreshed
git fetch origin changeset-release/canary
git show --stat origin/changeset-release/canary | head -20                      # confirm only the other changesets remain
npm view <package> version dist-tags
```

Report:
- Published version + dist-tag
- Canary commit SHA
- Tag pushed
- GitHub release URL
- Confirmation that the Version Packages PR now contains **only** the other changesets — the released one has been dropped from its scope.

## Stage 10: Cleanup

```bash
git branch -d release/<package>-<new-version>
```

## Package-specific notes

### `@bigcommerce/create-catalyst`

The CLI build (`tsup` via the package's `tsup.config.ts`) inlines `CLI_SEGMENT_WRITE_KEY`
at build time, falling back to the placeholder `'not-a-valid-segment-write-key'` if the
env var is missing. After Stage 3, verify the real key was embedded:

```bash
grep -c "not-a-valid-segment-write-key" packages/create-catalyst/dist/index.js
# expect: 0
```

If `1`, the env var wasn't loaded. Confirm `CLI_SEGMENT_WRITE_KEY` exists in `.env.local`,
and that the turbo pipeline for `build` declares it under `env` or `passThroughEnv` in
`turbo.json`. Re-run `pnpm build` after fixing.
