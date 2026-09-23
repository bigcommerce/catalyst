# Releasing the deployment preview action

This package is versioned with changesets, like every other package in
`packages/`. There is no separate release process to remember.

Consumers pin the moving major:

```yaml
uses: bigcommerce/catalyst/packages/deployment-preview-action@preview-action-v1
```

## Releasing

**1. Add a changeset with your change.**

```bash
pnpm changeset
```

Select `@bigcommerce/deployment-preview-action` and a bump type. Write the entry
for consumers of the action, not for Catalyst maintainers.

**2. Merge to `canary`.**

**3. Merge the Version Packages pull request** when it appears.

That releases the package: changesets bumps the version and writes the
CHANGELOG, then `changesets-release.yml` creates `preview-action-v<version>` and
moves `preview-action-v<major>` to that commit.

Nothing else is needed. The action ships on the same cadence as everything else
in the repository.

## Releasing a major

One extra thing, in the same pull request as the changeset: **the two in-repo
pins must move to the new major.**

```yaml
# core/.github/workflows/preview-deployment.yml
uses: bigcommerce/catalyst/.github/workflows/deployment-preview.yml@preview-action-v2

# .github/workflows/deployment-preview.yml
uses: bigcommerce/catalyst/packages/deployment-preview-action@preview-action-v2
```

The test suite fails if these disagree with the package version, so this is
caught in review rather than after release.

Merchants who already scaffolded keep pointing at `preview-action-v1`, which
keeps working. Only newly scaffolded projects pick up the new major.

## If something goes wrong

**The moving major points at the wrong commit.** Release a patch. The tag moves
to the new commit.

**An immutable tag points at the wrong commit.** Do not move it — anything
pinned to it would silently change. Release a patch instead.

**A release shipped a bug.** Fix forward with a patch. Consumers on the moving
major pick it up on their next run, with nothing to do on their side.

---

## Reference

### Tags

| Tag | Mutable | Purpose |
| --- | --- | --- |
| `preview-action-v<major>` | Moves each release | What consumers pin |
| `preview-action-v<major>.<minor>.<patch>` | Never | An exact release, for reproducible pins |

changesets also creates its usual `@bigcommerce/deployment-preview-action@<version>`
tag. Nothing references it — a workflow references an action as
`owner/repo/path@ref`, so a tag containing `@` cannot be used to pin one. The
`preview-action-v*` tags above exist for that reason, and are created by the
`Tag the deployment preview action` step in `changesets-release.yml`. That step
is idempotent: it does nothing unless the version in `package.json` is new.

### Catalyst CLI compatibility

The action deploys with the CLI the **consuming project** installs, since that
CLI builds the merchant's application. The `min-cli-version` input sets the
oldest supported version and is checked before deploying.

Raising that floor is a major bump: consumers on the moving major upgrade the
action automatically but not their CLI. Drift in the other direction is covered
by `native-hosting.yml`, which runs `catalyst deploy` with the same `--secret`
arguments on every push to `canary`.
