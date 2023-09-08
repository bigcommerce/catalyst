# Catalyst

> [!WARNING]
> - Catalyst is in development and should not be used in production environments.
> - The experimental `with-makeswift` version of Catalyst is a work in progress and not ready for feedback. During Catalyst’s Developer Preview, focus on the core Catalyst storefront features.

**Catalyst** is a composable, fully customizable headless storefront that offers a set of opinionated defaults. It is intended to fit the needs of modern developers, merchants, and shoppers. Catalyst is built with [Next.js (nextjs.org)](https://nextjs.org/) and uses our [React.js-based (react.dev)](https://react.dev/)**Reactant** storefront components.

The Catalyst monorepo contains the following:

* The core **Catalyst** Next.js storefront, in [apps/core](apps/core).
* An experimental version of Catalyst that uses the [Makeswift (makeswift.com)](https://www.makeswift.com/) low-code page builder, in [apps/with-makeswift](apps/with-makeswift).
* The **Reactant** storefront component library, in [packages/reactant](packages/reactant).
* The BigCommerce [GraphQL Storefront API (BigCommerce Dev Center)](https://developer.bigcommerce.com/docs/graphql-storefront) client, in [packages/client](packages/client).

## Requirements

* Node.js 18+
* [Corepack (nodejs.org)](https://nodejs.org/api/corepack.html)
* The [pnpm (pnpm.io)](https://pnpm.io/) package manager

## Getting Started

1. Install project dependencies:

```shell
corepack enable pnpm
pnpm install
```

2. **Set up environment variables.**

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
| `MAKESWIFT_SITE_API_KEY` | Only required for the experimental `with-makeswift` version of Catalyst. When working with the core product, comment out this variable. |

> [!INFO]
> For those who are experimenting with Makeswift, follow [Makeswift's text instructions (GitHub)](https://github.com/makeswift/makeswift/tree/main/examples/bigcommerce#visually-build-with-bigcommerce-components) or [video instructions (makeswift.com)](https://www.makeswift.com/components/nextjs/bigcommerce) to build and deploy a Makeswift integration with your Catalyst storefront. Next, locate the Makeswift API key in the [Makeswift app dashboard (makeswift.com)](https://app.makeswift.com/) by going to **Settings > Host > Site API Key**. Add the value to the `MAKESWIFT_SITE_API_KEY` variable in your `.env.local` file.

3. Optionally, to optimize your workflow, use the following command to configure VSCode with the project-specific settings the Catalyst team has created:

```shell
cp .vscode/settings.example.json .vscode/settings.json
```

4. Start the Catalyst development server!

```shell
pnpm run dev
```

The `dev` script runs all packages and apps in watch mode. The following table lists localhost URLs with the default ports. When a port is unavailable, Catalyst uses the next available port. For example, if `3000` is in use, `core` and `with-makeswift` will run on `3001` and `3002`, respectively.

| Process | URL with port |
|:--------|:--------------|
| Core Catalyst storefront | http://localhost:3000 |
| Experimental Makeswift-enabled storefront | http://localhost:3001 |
| Reactant Storybook | http://localhost:6006/ |

Happy developing! Let us know how things are going in the dedicated Slack channel.

## Development notes

Start editing the page by modifying `pages/index.tsx`. The server auto-reloads the browser page as you edit the file.

You can work with the BigCommerce GraphQL Storefront API at [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql), or edit this endpoint in `pages/api/graphql.ts`.

The `pages/api` directory maps to `/api/*`. Files in this directory are [Next.js API routes (nextjs.org)](https://nextjs.org/docs/api-routes/introduction), not React pages.

This project uses [next/font (nextjs.org)](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy using Vercel

One common way to deploy a Next.js app for development is to use the [Vercel Platform (vercel.com)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Consult the [Next.js deployment documentation (next.js)](https://nextjs.org/docs/deployment) for more details.

## Resources

### Next.js

- [Next.js documentation (nextjs.org)](https://nextjs.org/docs)
- [Interactive Next.js tutorial (nextjs.org)](https://nextjs.org/learn)
- [Next.js repository (GitHub)](https://github.com/vercel/next.js/)
