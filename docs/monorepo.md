## Catalyst's monorepo

The [main GitHub repository for Catalyst](https://github.com/bigcommerce/catalyst) contains a [monorepo](https://en.wikipedia.org/wiki/Monorepo) with multiple codebases such as the ["core" Next.js reference storefront application](https://github.com/bigcommerce/catalyst/tree/main/apps/core), [the component library](https://github.com/bigcommerce/catalyst/tree/main/packages/components), [the API client](https://github.com/bigcommerce/catalyst/tree/main/packages/client), [a Storybook instance that makes it easy to explore the component library](https://github.com/bigcommerce/catalyst/tree/main/apps/docs), functional tests, and so on.

If you are just interested in building a headless storefront based on Catalyst, most of this monorepo is not relevant to you, and that's why we've made the CLI install just the Next.js application from `apps/core` onto your computer when you create a new Catalyst storefront.

If you wish to contribute to Catalyst itself, or wish to create a fork of Catalyst to package and re-distribute, you may wish to start from the monorepo.

### Overview

This Catalyst monorepo contains the following:

- The core **Catalyst** Next.js storefront, in [apps/core](apps/core). This is what is installed when you run the command above in [Quickstart](#quickstart).
  - By default the storefront supports an end-to-end B2C focused shopper journey, inclusive of:
    - Global Header & Footers
    - Home Page
    - Product Listing Pages (Category, Brand, Search/Faceted search, Comparison page)
    - Product Detail Pages
    - Cart
    - Headless Redirected Checkout
  - This includes end-to-end support for most features connected to Customer accounts, like:
    - Price Lists
    - Customer-specific pricing
    - Customer-specific category visibility
    - Customer-specific product visibility
  - To extend into more complex B2C and B2B scenarios, you'll want to utilize more of our [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).
- The storefront component library, in [packages/components](packages/components), and a [Storybook](https://storybook.js.org/) instance to view the collection.
- The BigCommerce [GraphQL Storefront API](https://developer.bigcommerce.com/docs/graphql-storefront) client, in [packages/client](/packages/client).

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

### Contributing to the monorepo
See [CONTRIBUTING.md](/CONTRIBUTING.md)

### Requirements to use the monorepo

- Node.js 18+
- Corepack-managed `pnpm`

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

### Getting started

1. Clone the project to your local environment:

```bash
git clone git@github.com:bigcommerce/catalyst.git && cd catalyst
```

2. Use corepack to enable pnpm, then use pnpm to install project dependencies:

```bash
corepack enable pnpm && pnpm install
```

3. Set up environment variables by running:

```bash
cp .env.example .env.local
```

You can find documentation for each field in the `.env.local` file in [.env.example](.env.example).

4. If you use VS Code, use the following command to configure VSCode with the project-specific settings the Catalyst team has created:

```bash
cp .vscode/settings.example.json .vscode/settings.json
```

5. Start the Catalyst development server!

```bash
pnpm run dev
```

The `dev` script runs all packages and apps in watch mode.
The following table lists localhost URLs with the default ports.
When a port is unavailable, Catalyst uses the next available port.
For example, if `3000` is in use, `core` will run on `3001`.

| Process              | URL with port         |
| :------------------- | :-------------------- |
| Catalyst storefront  | http://localhost:3000 |
| Components Storybook | http://localhost:6006 |

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

### Testing

We use playwright to test our components and verify workflows on the UI. You can read all about playwright from the [official website documentation](https://playwright.dev/docs/intro).

To run the UI tests locally:

1. Setup an environment variable required to point the tests. You can use any catalyst latest deployment or localhost for running tests against your local changes.
```
PLAYWRIGHT_TEST_BASE_URL = 'https://catalyst-demo.site' || 'http://localhost:3000'
```

2. Navigate to test directory
```
cd packages/functional
```

3. Command to run all UI tests on chromium
```
npx playwright test tests/ui/* --ui --project=tests-chromium
```

4. Command to run specific test
```
npx playwright test tests/ui/core/components/Checkbox.spec.ts --ui --project=tests-chromium
```