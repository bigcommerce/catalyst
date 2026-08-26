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

When a pull request takes the preview over, the one that had it gets its comment
rewritten, so no thread is left advertising a URL that now serves someone else's
code.

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

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `project-uuid` | — | **Required.** Shared hosting project |
| `store-hash` | — | **Required.** |
| `access-token` | — | **Required.** Store API token |
| `storefront-token` | — | **Required.** |
| `channel-id` | — | **Required.** |
| `auth-secret` | — | **Required.** |
| `github-token` | `github.token` | Reads pull requests, manages comments |
| `command-phrase` | `redeploy preview` | Keep your job's `if:` in sync |
| `auto-deploy-newest` | `true` | `false` requires the command every time |
| `checkout` | `true` | See the warning below |
| `node-version` | `24` | |
| `pnpm-version` | `10` | The Catalyst CLI shells out to pnpm |
| `working-directory` | `.` | For monorepos |
| `api-host` | `api.bigcommerce.com` | |

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
It covers the deploy-eligibility rules and, importantly, which comment updates
notify and which stay silent — the difference between a useful preview bot and
one that emails everybody on every push.

## License

MIT, per the repository root [LICENSE](../../LICENSE).
