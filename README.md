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

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

<p align="center">
 <a href="https://www.catalyst.dev">🚀 catalyst.dev</a> •
 <a href="https://developer.bigcommerce.com/community">🤗 BigCommerce Developer Community</a> •
 <a href="https://github.com/bigcommerce/catalyst/discussions">💬 GitHub Discussions</a> •
 <a href="https://github.com/bigcommerce/catalyst/tree/main/docs">💡 Docs in this repo</a>
</p>

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)


## Deploy on Vercel

The easiest way to deploy your Catalyst Storefront is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [integration guide](https://vercel.com/docs/integrations/ecommerce/bigcommerce) for more details.

<div align="left">
  <a href="https://vercel.com/new/vercel-partner-demo/clone?demo-description=Developer-first%20ecommerce%3A%20customizable%20UI%20kit%2C%20comprehensive%20GraphQL%20API%20client%2C%20optimized%20for%20Next.js%20%26%20React%20Server%20Components.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F3TsvUfGCVcvajSguOlhjlm%2F5dc05aa00fe30e503d5105f3d96edafb%2FCatalyst_OG_Image.png&demo-title=Catalyst%20by%20BigCommerce&demo-url=https%3A%2F%2Fcatalyst-demo.site%2F&env=BIGCOMMERCE_STORE_HASH%2CBIGCOMMERCE_CHANNEL_ID%2CBIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN%2CTURBO_REMOTE_CACHE_SIGNATURE_KEY%2CAUTH_SECRET%2CCLIENT_LOGGER%2CENABLE_ADMIN_ROUTE%2CDEFAULT_REVALIDATE_TARGET&envDescription=These%20environment%20variables%20are%20necessary%20to%20run%20your%20Catalyst%20storefront.&envLink=https%3A%2F%2Fwww.catalyst.dev%2Fdocs%2Fenvironment-variables&from=templates&project-name=Catalyst%20by%20BigCommerce&repository-name=catalyst-by-bigcommerce&repository-url=https%3A%2F%2Fgithub.com%2Fbigcommerce%2Fcatalyst&root-directory=core&skippable-integrations=1g"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
</div>

## Quickstart

Create a new project interactively by running:

```bash
npm create @bigcommerce/catalyst@latest
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

- [Catalyst Documentation](https://catalyst.dev/docs/)
- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)

![-----------------------------------------------------](https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_hr.png)

> **Important:**
> If you just want to build a storefront, start with the [CLI](#quickstart) which will install the Next.js application in [/core](https://github.com/bigcommerce/catalyst/tree/main/core).
> If you wish to contribute back to Catalyst or create a fork of Catalyst, you can check the [docs for this monorepo](https://catalyst.dev/docs/monorepo) to get started.
