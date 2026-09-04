# Catalyst Deployment Preview

Deploys a [BigCommerce Catalyst](https://catalyst.dev) pull request preview to a
BigCommerce native hosting project, and keeps the pull request comments
describing it accurate.

## How previews work here

Every preview deploys into **one shared hosting project**, so there is exactly
one preview URL and it serves one pull request at a time. This is not a
limitation of the action: native hosting assigns a hostname per *project*, not
per deployment, so a second deployment replaces the first at the same address.

That shapes the behaviour:

| Event | Result |
| --- | --- |
| Push to the newest open pull request | Deploys |
| Push to any older pull request | No deploy; its comment explains how to claim the preview |
| `redeploy preview` comment on any pull request | Deploys that pull request |

When a pull request takes the preview over, the one that had it gets a notice in
place of its old comment, so no thread is left advertising a URL that now serves
someone else's code. That notice does not name the pull request that took over —
which keeps it true when a third one takes it later, and means it is written once
and never revisited.

Finding that pull request costs one listing call, not one per open pull request.
Open pull requests are walked newest-activity-first and the search stops at the
first one holding a preview, because only one ever does.

## Setup

### 1. Create the shared project

```bash
catalyst project create my-store-preview
catalyst project list          # copy the UUID
```

### 2. Add configuration

Only three of these are credentials. The project UUID, store hash and channel
ID are configuration, so they belong in **Variables**; the rest in **Secrets**. Both live under
*Settings → Secrets and variables → Actions*, or under an environment if you use
one.

| Name | Kind | Notes |
| --- | --- | --- |
| `PREVIEW_DEPLOYMENT_PROJECT_UUID` | variable | From step 1 |
| `BIGCOMMERCE_STORE_HASH` | variable | From your control panel URL |
| `BIGCOMMERCE_PREVIEW_DEPLOYMENT_ACCESS_TOKEN` | secret | Needs `store_infrastructure_projects_manage` and `store_infrastructure_deployments_manage` |
| `BIGCOMMERCE_STOREFRONT_TOKEN` | secret | Required by the Catalyst build |
| `BIGCOMMERCE_CHANNEL_ID` | variable | Channel the preview serves |
| `AUTH_SECRET` | secret | `openssl rand -hex 32`. Do not reuse production's |

> **Using a GitHub Environment?** Pass its name as the `environment` input and
> do **not** pass `project-uuid`. Expressions in your `with:` block are
> evaluated in your job, which does not declare the environment, so an
> environment-scoped `vars.PREVIEW_DEPLOYMENT_PROJECT_UUID` would resolve to an
> empty string there. Left unset, the reusable workflow reads it from inside
> the job that does declare the environment.

### 3. Add the workflow

Copy [`examples/with-reusable-workflow.yml`](examples/with-reusable-workflow.yml)
to `.github/workflows/preview-deployment.yml`:

```yaml
name: Preview Deployment

on:
  pull_request:
    types: [opened, reopened, synchronize]
  issue_comment:
    types: [created]

jobs:
  preview:
    uses: bigcommerce/catalyst/.github/workflows/deployment-preview.yml@preview-action-v1
    with:
      environment: Preview Deployments
    secrets:
      access-token: ${{ secrets.BIGCOMMERCE_PREVIEW_DEPLOYMENT_ACCESS_TOKEN }}
      storefront-token: ${{ secrets.BIGCOMMERCE_STOREFRONT_TOKEN }}
      auth-secret: ${{ secrets.AUTH_SECRET }}
```

> **Merge this to your default branch before testing `redeploy preview`.**
> GitHub always reads `issue_comment` workflows from the default branch, so on a
> feature branch the command appears to do nothing at all.

The reusable workflow is recommended because it sets `concurrency`,
`permissions` and `environment` for you. A workflow can declare those; an action
cannot. The concurrency group matters — all previews share one project, so two
deploys at once would race for it.

To drive the action directly instead, see
[`examples/with-action.yml`](examples/with-action.yml), and set the concurrency
group yourself.

A `redeploy preview` comment adds its own check row, named by the
`check-name` input (`Preview Deployment (redeploy)` by default). An
`issue_comment` run is not attached to a commit, so GitHub shows nothing in the
pull request's checks on its own.

Keep that name distinct from your job's. GitHub refuses API changes to the check
runs it manages for a job, so a row named after the job would be found by the
reuse lookup and then rejected with a 403. The action tags its own rows with an
`external_id` and only ever touches those; on a commit that already ran a push
deploy you will see two rows, reporting two different events.

Grant `checks: write` if you call the action directly, so a `redeploy preview`
comment appears in the pull request checks rather than only as a reaction on the
comment. Without it the deploy still runs; it is just less visible.

## Inputs

Configuration can be passed as an input, or set as the environment variable in
the second column. A value must come from one of the two; the action fails with
a message naming anything missing.

| Input | Or set | Description |
| --- | --- | --- |
| `project-uuid` | `BIGCOMMERCE_PREVIEW_PROJECT_UUID` | Shared hosting project. Absent means previews are off |
| `store-hash` | `BIGCOMMERCE_STORE_HASH` | |
| `access-token` | `BIGCOMMERCE_ACCESS_TOKEN` | Store API token |
| `storefront-token` | `BIGCOMMERCE_STOREFRONT_TOKEN` | |
| `channel-id` | `BIGCOMMERCE_CHANNEL_ID` | |
| `auth-secret` | `AUTH_SECRET` | |

The remaining inputs are optional:

| Input | Default | Description |
| --- | --- | --- |
| `github-token` | `github.token` | Reads pull requests, manages comments |
| `command-phrase` | `redeploy preview` | Keep your job's `if:` in sync |
| `auto-deploy-newest` | `true` | `false` requires the command every time |
| `checkout` | `true` | See the warning below |
| `node-version` | `24` | |
| `pnpm-version` | `10` | The Catalyst CLI shells out to pnpm |
| `working-directory` | `.` | For monorepos |
| `api-host` | `api.bigcommerce.com` | |
| `min-cli-version` | `1.2.0` | Oldest `@bigcommerce/catalyst` this action supports |
| `check-name` | `Preview Deployment (redeploy)` | Check row a redeploy reports against. Keep it distinct from your job's `name:` |

## Outputs

| Output | Description |
| --- | --- |
| `deployed` | `"true"` when this run deployed |
| `url` | Preview URL, set only when this run deployed |
| `reason` | `newest`, `takeover`, `not-newest`, `manual-only`, `not-applicable` |

## Security

The `redeploy preview` command builds and deploys pull request code with your
store credentials in scope. Three rules protect that, all enforced inside the
action so they cannot be omitted by mistake:

- **Write access required.** The commenter's permission is checked against the
  collaborators API. `read` and `none` are rejected.
- **Same-repository pull requests only.** Forks are refused on both paths.
- **Checks run before checkout.** Validation completes before any pull request
  code is fetched, let alone executed by `pnpm install`.

**Do not check out the repository before this action.** It performs its own
checkout, after those checks and against the pull request's merge ref, which the
`issue_comment` event does not give you by default. Set `checkout: false` only
if you are handling that yourself.

Pin to an action release tag, or a commit SHA if your policy requires it:

```yaml
uses: bigcommerce/catalyst/packages/deployment-preview-action@preview-action-v1
uses: bigcommerce/catalyst/packages/deployment-preview-action@<sha>
```

The action is tagged separately from Catalyst's package releases, as
`preview-action-v<major>` (moving) and `preview-action-v<major>.<minor>.<patch>`
(immutable). Catalyst's own changeset tags look like
`@bigcommerce/create-catalyst@2.0.3`; a `@` inside a ref is ambiguous against
`path@ref` parsing, so those tags are not usable here.

## Catalyst CLI compatibility

The action deploys using the CLI **your project** installs, not one of its own.

| Action major | Requires |
| --- | --- |
| `preview-action-v1` | `@bigcommerce/catalyst` >= 1.2.0 |

It checks this before deploying and fails with a clear message if your CLI is
older. Override the floor with the `min-cli-version` input.

## Requirements

- The project must be on Catalyst native hosting, with `@bigcommerce/catalyst`
  in its dependencies.
- **pnpm.** The Catalyst CLI shells out to `pnpm` to build, so npm and Yarn
  projects will not work.
- Node 24 or newer, matching Catalyst's own requirement.

## Contributing

See the repository root [CONTRIBUTING.md](../../CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](../../CODE_OF_CONDUCT.md). Releases for this package are
documented in [CHANGELOG.md](CHANGELOG.md).

From the repository root, `pnpm test` runs every package's suite through turbo.
To run just this one:

```bash
pnpm --filter @bigcommerce/deployment-preview-action test
```

```bash
pnpm --filter @bigcommerce/deployment-preview-action test
```

The suite runs the preview logic against a stubbed BigCommerce and GitHub API.
Two things it pins down deliberately: which comment updates notify and which stay
silent — the difference between a useful preview bot and one that emails everybody
on every push — and that the sweep stops at the pull request holding the preview
rather than walking every open one.

## Releasing

Released separately from Catalyst's changesets pipeline, on its own cadence.
Consumers pin the moving major `preview-action-v<major>`, which advances with
each release.

See [RELEASES.md](RELEASES.md) for the process, the tag scheme, and how it has
to be sequenced against `@bigcommerce/catalyst-core` releases.

## License

MIT, per the repository root [LICENSE](../../LICENSE).
