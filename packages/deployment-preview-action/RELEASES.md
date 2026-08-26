# Releasing the deployment preview action

This package is tagged and released on its own, separately from Catalyst's
changesets pipeline. An action fix does not wait on a storefront release.

Consumers pin the moving major:

```yaml
uses: bigcommerce/catalyst/packages/deployment-preview-action@preview-action-v1
```

## Before you start

Check whether a **Version Packages (canary)** pull request is open. Merging one
releases `@bigcommerce/catalyst-core`, which is what ships
`core/.github/workflows/preview-deployment.yml` to merchants. If that workflow
points at a tag you have not created yet, newly scaffolded projects get
`Unable to resolve action` on their first pull request.

If one is open, either cut this release first, or let someone know not to merge
it until you have.

## Releasing a patch or a minor

**1. Open a pull request** bumping `version` in `package.json` and adding a
matching `## <version>` section to `CHANGELOG.md`.

Nothing bumps the version automatically. The release notes are taken verbatim
from that CHANGELOG section, so write it for consumers.

**2. Merge to `canary`.**

**3. Run the release workflow as a dry run.**

Actions → **Release Deployment Preview Action** → Run workflow, against
`canary`, leaving *dry-run* checked. It reports the tags it would create and
runs every safety check without creating anything.

If the workflow is not listed, it is not on the default branch yet.
`workflow_dispatch` only appears for workflows that exist there.

**4. Run it again with *dry-run* unchecked.**

It creates `preview-action-v<version>`, moves `preview-action-v<major>` to that
commit, and opens a GitHub Release.

**5. Verify.**

```bash
git ls-remote origin 'refs/tags/preview-action-v*'
```

Both tags should point at the same commit. Then trigger a consumer workflow
pinned to the moving major and confirm the run picks up your change.

## Releasing a major

Same four steps, with one addition to step 1: **the two in-repo pins must move
to the new major in the same pull request.**

```yaml
# core/.github/workflows/preview-deployment.yml
uses: bigcommerce/catalyst/.github/workflows/deployment-preview.yml@preview-action-v2

# .github/workflows/deployment-preview.yml
uses: bigcommerce/catalyst/packages/deployment-preview-action@preview-action-v2
```

The test suite fails if these disagree with the package version, and the release
workflow refuses to run, naming both files.

Merchants who already scaffolded keep pointing at `preview-action-v1` and keep
working. Only newly scaffolded projects pick up the new major.

## If something goes wrong

**The moving major points at the wrong commit.** Fix the problem and run the
workflow again from the right commit. The major is meant to move.

**An immutable tag points at the wrong commit.** Do not move it — anything
pinned to it would silently change. Bump the patch and release again.

**A release shipped a bug.** Fix forward with a patch. Consumers on the moving
major pick it up on their next run, with nothing to do on their side.

---

## Reference

### Tags

| Tag | Mutable | Purpose |
| --- | --- | --- |
| `preview-action-v<major>` | Moves each release | What consumers pin |
| `preview-action-v<major>.<minor>.<patch>` | Never | An exact release, for reproducible pins |

### What the release workflow checks

- `version` is semver
- The immutable tag does not already exist, so a released version cannot be
  silently repointed
- Both in-repo pins reference the major being released

All three run during a dry run too.

### Why this is not part of changesets

Every tag changesets produces here contains an `@`
(`@bigcommerce/catalyst-core@1.10.1`). A workflow references an action as
`owner/repo/path@ref`, so an `@` inside the ref is ambiguous and cannot be used
to pin one.

The package is therefore listed in `ignore` in `.changeset/config.json`. That is
deliberate — do not remove it without replacing the tag scheme above.

### Catalyst CLI compatibility

The action deploys with the CLI the **consuming project** installs, since that
CLI builds the merchant's application. The `min-cli-version` input sets the
oldest supported version and is checked before deploying, so an old CLI fails
with a clear message rather than an unrecognised-flag error.

Raising that floor is a major bump: consumers on the moving major upgrade the
action automatically but not their CLI.

Drift in the other direction is largely covered already — `native-hosting.yml`
runs `catalyst deploy` with the same `--secret` arguments on every push to
`canary`, so a CLI change that broke this action would show up there.
