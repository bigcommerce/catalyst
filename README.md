# Catalyst

> [!WARNING]
> - Catalyst is in development and should not be used in production environments.
> - The experimental `with-makeswift` version of Catalyst is a work in progress and not ready for feedback. During Catalyst’s Developer Preview, focus on the core Catalyst storefront features.

**Catalyst** is a composable, fully customizable headless storefront that offers a set of opinionated defaults. It is intended to fit the needs of modern developers, merchants, and shoppers. Catalyst is built with [Next.js (nextjs.org)](https://nextjs.org/) and uses our [React.js-based (react.dev)](https://react.dev/) **Reactant** storefront components.

The Catalyst monorepo contains the following:

* The core **Catalyst** Next.js storefront, in [apps/core](apps/core).
* An experimental version of Catalyst that uses the [Makeswift (makeswift.com)](https://www.makeswift.com/) low-code page builder, in [apps/with-makeswift](apps/with-makeswift).
* The **Reactant** storefront component library, in [packages/reactant](packages/reactant).
* The BigCommerce [GraphQL Storefront API (BigCommerce Dev Center)](https://developer.bigcommerce.com/docs/graphql-storefront) client, in [packages/client](packages/client).

## Requirements

* [Node.js 18+](#node.js)
* [Corepack-managed pnpm](#corepack-and-pnpm)

### Node.js

Use Node.js 18+.

You may wish to use Node Version Manager, or [nvm (GitHub)](https://github.com/nvm-sh/nvm#installing-and-updating), to facilitate moving back and forth between different versions of node. You can install nvm using either the instructions at the preceding link or your operating system package manager of choice.

### Corepack and pnpm

This project uses [corepack (nodejs.org)](https://nodejs.org/api/corepack.html) to install and enable the [pnpm (pnpm.io)](https://pnpm.io/) package manager. Corepack comes bundled with Node 18, so you do not need to install either of these packages on their own.

Catalyst is configured such that pnpm replaces npm. When you enhance your project with additional packages or scripts, be sure to use the `pnpm` command. For more information, see the [pnpm documentation](https://pnpm.io/cli/add).

## Getting Started

1. [Fork the project repository (GitHub)](https://docs.github.com/en/get-started/quickstart/fork-a-repo), then clone the project to your local environment:

```shell
git clone git@github.com:{yourGitHubUsername}/catalyst.git && cd catalyst
```

2. To help stay up to date with the latest changes, add the BigCommerce repo to your project as the upstream repository:

```shell
git remote add upstream git@github.com:bigcommerce/catalyst.git
```

3. Use corepack to enable pnpm, then use pnpm to install project dependencies:

```shell
corepack enable pnpm
```

```shell
pnpm install
```

4. **Set up environment variables.**

```shell
cp .env.example .env.local
```

Update `.env.local` with the following values:

| Variable | Description |
|:---------|:------------|
| `BIGCOMMERCE_STORE_HASH` | The hash visible in the subject store's URL when signed in to the store control panel. The control panel URL is of the form `https://store-{hash}.mybigcommerce.com`. Set this environment variable to the value of `{hash}` for the subject store. |
| `BIGCOMMERCE_ACCESS_TOKEN` | [Create a store-level API account (BigCommerce Dev Center)](https://developer.bigcommerce.com/api-docs/getting-started/api-accounts#creating-store-level-api-credentials) with the following [OAuth scopes (BigCommerce Dev Center)](https://developer.bigcommerce.com/api-docs/getting-started/api-accounts#oauth-scopes): Carts `read-only` and Storefront API Customer Impersonation Tokens `manage`. |
| `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN` | Use the store-level API account access token you created to make a call to the BigCommerce REST [Create a customer impersonation token (BigCommerce Dev Center)](https://developer.bigcommerce.com/docs/storefront-auth/tokens/customer-impersonation-token#create-a-token) endpoint. You can also get a customer impersonation token by accessing **Settings > Storefront API Playground** in the control panel, clicking `HTTP HEADERS` at the bottom of the screen, and copying the value of the `Authorization` header. Make sure to remove the `Bearer ` prefix from the copied header value. |
| `BIGCOMMERCE_CDN_HOSTNAME` | Can remain unchanged from its default value. |
| `BIGCOMMERCE_CHANNEL_ID` | Set the storefront channel id. Defaults to 1, the default storefront channel. Note: Will need to create a site for the channel before you can hit the GraphQL endpoint. |
| `MAKESWIFT_SITE_API_KEY` | Only required for the experimental `with-makeswift` version of Catalyst. When working with the core product, comment out this variable. For more about setting this variable, consult the [with-makeswift README](https://github.com/bigcommerce/catalyst/blob/main/apps/with-makeswift/README.md#create-a-makeswift-api-key). |

5. Optionally, to optimize your workflow, use the following command to configure VSCode with the project-specific settings the Catalyst team has created:

```shell
cp .vscode/settings.example.json .vscode/settings.json
```

6. Start the Catalyst development server!

```shell
pnpm run dev
```

The `dev` script runs all packages and apps in watch mode. The following table lists localhost URLs with the default ports. When a port is unavailable, Catalyst uses the next available port. For example, if `3000` is in use, `core` and `with-makeswift` will run on `3001` and `3002`, respectively.

| Process | URL with port |
|:--------|:--------------|
| Core Catalyst storefront | http://localhost:3000 |
| Experimental Makeswift-enabled storefront | http://localhost:3001 |
| Reactant Storybook | http://localhost:6006 |

Happy developing! Let us know how things are going in the dedicated Slack channel.

## Deploy using Vercel

One common way to deploy a Next.js app for development is to use the [Vercel Platform (vercel.com)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Consult the [Next.js deployment documentation (next.js)](https://nextjs.org/docs/deployment) for more details.

## Resources

### Next.js

- [Next.js documentation (nextjs.org)](https://nextjs.org/docs)
- [Interactive Next.js tutorial (nextjs.org)](https://nextjs.org/learn)
- [Next.js repository (GitHub)](https://github.com/vercel/next.js/)
