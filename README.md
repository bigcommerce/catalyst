<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />
<br />

<div align="center">

[![MIT License](https://img.shields.io/github/license/bigcommerce/catalyst)](LICENSE.md)
[![Lighthouse Report](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml) [![Lint, Typecheck, GraphQL Codegen](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml)

</div>

**Catalyst** is the composable, fully customizable headless commerce framework for
[BigCommerce](https://www.bigcommerce.com/). Catalyst is built with [Next.js](https://nextjs.org/), uses
our [React](https://react.dev/) storefront components, and is backed by the
[GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

By choosing Catalyst, you'll have a fully-functional storefront within a few seconds, and spend zero time on wiring
up APIs or building SEO, Accessibility, and Performance-optimized ecommerce components you've probably written many
times before. You can instead go straight to work building your brand and making this your own.

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

<p align="center">
 <a href="https://www.catalyst.dev">🚀 catalyst.dev</a> •
 <a href="https://developer.bigcommerce.com/community">🤗 BigCommerce Developer Community</a> •
 <a href="https://github.com/bigcommerce/catalyst/discussions">💬 GitHub Discussions</a>
</p>

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)


## Deploy on Vercel

The easiest way to deploy your Catalyst Storefront is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

<div align="left">
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/bigcommerce/catalyst&env=BIGCOMMERCE_STORE_HASH,BIGCOMMERCE_CHANNEL_ID,BIGCOMMERCE_ACCESS_TOKEN,BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN,AUTH_SECRET,TURBO_REMOTE_CACHE_SIGNATURE_KEY&envDescription=API+Keys+needed+to+deploy+your+Catalyst+Storefront&envLink=https://github.com/bigcommerce/catalyst/blob/main/.env.example&project-name=my-faster-storefront&repository-name=my-faster-storefront&demo-title=BigCommerce+Catalyst+with+Vercel&demo-description=Create+a+BigCommerce+Catalyst+Storefront+and+Deploy+to+Vercel&demo-url=catalyst-git-main.store&demo-image=https://storage.googleapis.com/s.mkswft.com/RmlsZTozODgzZmY3Yy1hNmVlLTQ1MGUtYjRkMS1mMjEyNzgxNjk5MTY%3D/Social-image-Catalyst.png&root-directory=apps/core"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
</div>

## Quickstart

Create a new project interactively by running:

```bash
npm create catalyst-storefront@latest
```

You'll then get the following prompts:

```console
? What would you like to call your project?  my-faster-storefront
? Which would you like?
❯ Link Catalyst to a BigCommerce Store
  Use sample data

? Would you like to create a new channel? y

? What would you like to name the new channel? My Faster Storefront

Success! Created 'my-faster-storefront' at '/Users/first.last/Documents/GitHub/my-faster-storefront'
```

Next steps:

```bash
cd my-faster-storefront && npm run dev
```
Learn more about Catalyst at [catalyst.dev](https://catalyst.dev).

## Resources

- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)

> [!IMPORTANT]
> The rest of this README is related to development on top of this monorepo.
> If you just want to build a storefront, start with the [CLI](#quickstart).

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

## Overview

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
- The BigCommerce [GraphQL Storefront API](https://developer.bigcommerce.com/docs/graphql-storefront) client, in [packages/client](packages/client).

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

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
