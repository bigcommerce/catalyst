<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />
<br />

<div align="center">

[![MIT License](https://img.shields.io/github/license/bigcommerce/catalyst)](LICENSE.md)
[![Lighthouse Report](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/lighthouse.yml) [![Lint, Typecheck, gql.tada](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml/badge.svg)](https://github.com/bigcommerce/catalyst/actions/workflows/basic.yml)

</div>

**Catalyst** is the composable, fully customizable headless commerce framework for
[BigCommerce](https://www.bigcommerce.com/). Catalyst is built with [Next.js](https://nextjs.org/), uses
our [React](https://react.dev/) storefront components, and is backed by the
[GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

By choosing Catalyst, you'll have a fully-functional storefront within a few seconds, and spend zero time on wiring
up APIs or building SEO, Accessibility, and Performance-optimized ecommerce components you've probably written many
times before. You can instead go straight to work building your brand and making this your own.

## Demo

- [Catalyst Demo](https://catalyst-demo.site)

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

<p align="center">
 <a href="https://www.catalyst.dev">🚀 catalyst.dev</a> •
 <a href="https://developer.bigcommerce.com/community">🤗 BigCommerce Developer Community</a> •
 <a href="https://github.com/bigcommerce/catalyst/discussions">💬 GitHub Discussions</a> •
 <a href="/docs">💡 Docs in this repo</a>
</p>

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

## Deploy via One-Click Catalyst App

The easiest way to deploy your Catalyst Storefront is to use the [One-Click Catalyst App](http://login.bigcommerce.com/deep-links/app/53284) available in the BigCommerce App Marketplace.

Check out the [Catalyst.dev One-Click Catalyst Documentation](https://www.catalyst.dev/docs/getting-started) for more details.

## Getting Started

**Requirements:**

- A [BigCommerce account](https://www.bigcommerce.com/start-your-trial)
- Node.js version 24
- Corepack-enabled `pnpm`

  ```bash
  corepack enable pnpm
  ```

1. Install the latest version of Catalyst:

   ```bash
   pnpm create @bigcommerce/catalyst@latest
   ```

2. Run the local development server:

   ```bash
   pnpm run dev
   ```

Learn more about Catalyst at [catalyst.dev](https://catalyst.dev).

## GraphQL Schema and Types

Catalyst types its GraphQL documents with [gql.tada](https://gql-tada.0no.co/), which needs a local
copy of your store's GraphQL Storefront API schema. Two files at the project root hold it:

| File                       | What it is                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| `bigcommerce.graphql`      | Your channel's Storefront API schema, in SDL.                     |
| `bigcommerce-graphql.d.ts` | The gql.tada introspection type that `client/graphql.ts` imports. |

Both are build-time and editor-time artifacts. Nothing reads them while your storefront serves a
request — they exist so `tsc`, ESLint, and your editor can check every query and mutation against
the real schema.

### Generating them

```bash
pnpm run generate
```

(`npm run generate` if your project uses npm — the `generate` script in `package.json` is the same
either way.)

The script reads `BIGCOMMERCE_STORE_HASH`, `BIGCOMMERCE_CHANNEL_ID`, and
`BIGCOMMERCE_STOREFRONT_TOKEN` from `.env.local`, downloads the schema for that channel, and writes
both files. `pnpm run dev`, `pnpm run build`, and `pnpm run deploy` each run `generate` first, so the
usual development loop keeps them current on its own. Run it directly after switching channels or
when you want to pick up a Storefront API schema change mid-session.

### Commit both files

**Commit `bigcommerce.graphql` and `bigcommerce-graphql.d.ts` to your repository.** They are
deliberately absent from `.gitignore`:

- `pnpm run lint` and `pnpm run typecheck` fail without `bigcommerce-graphql.d.ts`, because
  `client/graphql.ts` imports it. Committing it lets CI check a pull request with no store
  credentials at all.
- A fresh clone gets GraphQL autocomplete and validation immediately, before anything is run.
- Schema changes land in your diffs, so a field your storefront depends on going away is something
  you see in review rather than at deploy time.

They show up as untracked the first time you run `pnpm run dev`, because `catalyst create` makes its
initial commit before the first `generate`. Add them:

```bash
git add bigcommerce.graphql bigcommerce-graphql.d.ts
git commit -m "Add generated GraphQL schema and types"
```

### Local versus CI regeneration

`build` and `deploy` regenerate the schema before Next.js compiles, so a deployment always uses
whatever is live on the channel at that moment; the committed copies are never what ships. Your
build environment therefore needs the same three variables `generate` does — the ones already
required for the build itself.

A CI job that only lints, typechecks, or runs unit tests needs no credentials, because it uses the
committed files. If you would rather have CI verify that they are current, run `pnpm run generate`
there and fail the job when `git diff --exit-code` reports a change.

## Resources

- [Catalyst Documentation](https://catalyst.dev/docs/)
- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
