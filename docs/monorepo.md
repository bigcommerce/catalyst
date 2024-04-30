**Overview**
# The Catalyst monorepo

## Primary contents

The [main GitHub repository for Catalyst](https://github.com/bigcommerce/catalyst) is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) with multiple codebases, including but not limited to the following:

* The [core Next.js reference storefront application, in /apps/core](https://github.com/bigcommerce/catalyst/tree/main/apps/core)
* [The component library, in /packages/components](https://github.com/bigcommerce/catalyst/tree/main/packages/components)
* [The API client, in /packages/client](https://github.com/bigcommerce/catalyst/tree/main/packages/client)
* [A Storybook instance to help explore the component library in /apps/docs](https://github.com/bigcommerce/catalyst/tree/main/apps/docs)
* [Product documentation, in /docs](https://github.com/bigcommerce/catalyst/tree/main/docs)
* [Functional tests in Playwright, in /packages/functional](https://github.com/bigcommerce/catalyst/tree/main/packages/functional)

### The monorepo and the CLI

The [Catalyst CLI](https://www.npmjs.com/package/@bigcommerce/create-catalyst) installs just the Next.js application from `apps/core` onto your computer when you create a new Catalyst storefront.

If you are interested solely in building a headless storefront based on Catalyst, most of this monorepo is not relevant to you.

Start from the monorepo if you wish to contribute to Catalyst itself or create a fork to package and re-distribute it.

## Contributing to the monorepo

See [CONTRIBUTING.md](https://github.com/bigcommerce/catalyst/tree/main/CONTRIBUTING.md).

## Getting started from the monorepo

### Prerequisites

* Node.js 20+
* Corepack-managed `pnpm`

### Setup

1. Clone the project to your local environment:

```shell copy
git clone git@github.com:bigcommerce/catalyst.git && cd catalyst
```

2. Use corepack to enable pnpm, then use pnpm to install project dependencies:

```shell copy
corepack enable pnpm && pnpm install
```

3. Set up environment variables by running:

```shell copy
cp .env.example .env.local
```

You can find documentation for each field in the `.env.local` file, described in [.env.example](https://github.com/bigcommerce/catalyst/tree/main/.env.example).

4. If you use VS Code, use the following command to configure VSCode with the project-specific settings the Catalyst team has created:

```shell copy
cp .vscode/settings.example.json .vscode/settings.json
```

5. Start the Catalyst development server!

```shell copy
pnpm run dev
```

The `dev` script runs all packages and apps in watch mode.

The following table lists localhost URLs with the default ports. When a port is unavailable, Catalyst uses the next available port. For example, if `3000` is in use, `core` will run on `3001`.

| Process | URL with port |
|:--------|:--------------|
| Catalyst storefront | `http://localhost:3000` |
| Component reference in Storybook | `http://localhost:6006` |

## Testing

We use Playwright to test our components and verify workflows on the UI. To learn more, see the [official website documentation](https://playwright.dev/docs/intro).

To run the UI tests locally:

1. Set up the environment variable required to point the tests to either a hosted or local Catalyst instance.

```shell copy
PLAYWRIGHT_TEST_BASE_URL='https://catalyst-demo.site' || 'http://localhost:3000'
```

2. Navigate to the test directory:

```shell copy
cd apps/core
```

3. Run all UI tests in Chromium:

```shell copy
npx playwright test tests/ui/* --ui --project=tests-chromium
```

4. Run a specific test in Chromium:

```shell copy
npx playwright test tests/ui/core/components/Checkbox.spec.ts --ui --project=tests-chromium
```
