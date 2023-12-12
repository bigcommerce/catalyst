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

1. Clone the project to your local environment:

```shell
git clone git@github.com:bigcommerce/catalyst.git && cd catalyst
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

This repository contains a setup script that generates a local development environment file, `.env.local`. The environment file contains the authentication credentials and other variables required to connect Catalyst to an existing BigCommerce store. Run the script from the root directory of this repository and follow the prompts:

```shell
node scripts/setup.mjs
```

*If you prefer to manually enter your own environment variables, you can run `cp .env.example .env.local` to get started.*

The following table contains a description of each variable in the `.env.local` file:

| Variable | Description |
|:---------|:------------|
| `BIGCOMMERCE_STORE_HASH` | The hash visible in the subject store's URL when signed in to the store control panel. The control panel URL is of the form `https://store-{hash}.mybigcommerce.com`. |
| `BIGCOMMERCE_ACCESS_TOKEN` | The access token from a [store-level API account (BigCommerce Dev Center)](https://developer.bigcommerce.com/api-docs/getting-started/api-accounts#store-level-api-accounts). The only [OAuth scope (BigCommerce Dev Center)](https://developer.bigcommerce.com/api-docs/getting-started/api-accounts#oauth-scopes) required to run Catalyst is Carts `read-only`. |
| `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN` | A bearer token that authorizes server-to-server requests to the [GraphQL Storefront API (BigCommerce Dev Center)](https://developer.bigcommerce.com/docs/storefront/graphql). |
| `BIGCOMMERCE_CDN_HOSTNAME` | Ensures that the Next.js Image Optimization API is configured to serve external images from BigCommerce. Used in the Next.js Configuration file. For more information, see the [Next.js Image Component API Reference (next.js)](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns). |
| `BIGCOMMERCE_CHANNEL_ID` | The channel ID for the Catalyst storefront's dedicated channel. |
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

### Using the `vercel` CLI

If you are able to install and use the [Vercel CLI (vercel.com)](https://vercel.com/cli) on your local machine, you can use it to pull the environment variables from Vercel. The `vercel` CLI is not required to run Catalyst locally.

1. Link the app to your Vercel project

This command will take you through the process of linking the app to your Vercel project.

```shell
vercel link
```

2. Pull the environment variables from Vercel

This will pull the `development` environment variables from Vercel and write them to `.env.local`.

```shell
vercel env pull .env.local
```

If you need to pull the production environment variables for debugging, use the `--prod` flag.

```shell
vercel env pull .env.production --prod
```

## Deploy using Vercel

One common way to deploy a Next.js app for development is to use the [Vercel Platform (vercel.com)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Consult the [Next.js deployment documentation (next.js)](https://nextjs.org/docs/deployment) for more details.

## Resources

### Next.js

- [Next.js documentation (nextjs.org)](https://nextjs.org/docs)
- [Interactive Next.js tutorial (nextjs.org)](https://nextjs.org/learn)
- [Next.js repository (GitHub)](https://github.com/vercel/next.js/)
