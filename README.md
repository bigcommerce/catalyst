# Catalyst

> [!WARNING]
> - Catalyst is in development and should not be used in production environments
> - The experimental `with-makeswift` version of Catalyst is not quite ready for feedback. During Catalyst’s developer preview you should be focused on the core Catalyst storefront

A fully customizable headless storefront, Catalyst offers a set of opinionated defaults, while being composable to fit the needs of the developer, merchant, and shopper.

The Catalyst monorepo contains:
* The core Catalyst Next.js storefront, in [apps/core](apps/core).
* An experimental version of the Catalyst storefront for use with [Makeswift](https://www.makeswift.com/), in [apps/with-makeswift](apps/with-makeswift).
* The Reactant storefront component library, in [packages/reactant](packages/reactant).
* Our [BigCommerce Storefront API](https://developer.bigcommerce.com/docs/graphql-storefront) client, in [packages/client](packages/client).

## Requirements

Catalyst requires Node.js version 18 or greater, and uses [corepack](https://nodejs.org/api/corepack.html) and [pnpm](https://pnpm.io/).

## Getting Started

1. Install project dependencies:

```bash
corepack enable pnpm
pnpm install
```

2. Setup environment variables:

```bash
 cp .env.example .env.local
```

Update `.env.local` with the appropriate values:
* `BIGCOMMERCE_STORE_HASH` should be the hash visible in your store's url when logged in to the control panel. The url will be of the form `https://store-{hash}.mybigcommerce.com`. Set this environment variable to the value of `{hash}` for your store.
* `BIGCOMMERCE_ACCESS_TOKEN` can be created in your store's control panel, in the `Settings->Store-level API accounts` section. This token should have `read-only` access for the `Carts` scope, and `manage` access for `Storefront API customer impersonation tokens`.
* `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN` can be created via the [BigCommerce API](https://developer.bigcommerce.com/docs/storefront-auth/tokens/customer-impersonation-token#create-a-token) using the token created above. You can also get a working token by accessing `Settings->Storefront API Playground` in the control panel, clicking `HTTP HEADERS` at the bottom of the screen, and copying the value of the `Authorization` header (excluding the `Bearer ` prefix).
* `BIGCOMMERCE_CDN_HOSTNAME` can remain unchanged from its default value.
* `MAKESWIFT_API_KEY` is only used by the experimental `with-makeswift` version of Catalyst, and can be left blank when working with the core product.

> [!WARNING]
> The experimental `with-makeswift` version of Catalyst is not ready and users should focus on the core product only. While we are not looking for feedback yet with the experimental `with-makeswift` version of Catalyst, the following onboarding instructions are if users want to experiment with the current state of the experimental `with-makeswift` version of Catalyst. During Developer Preview you should be looking at Core.

---

Follow the instructions at https://github.com/makeswift/makeswift/tree/main/examples/bigcommerce#visually-build-with-bigcommerce-components to build and deploy a MakeSwift integration with your BigCommerce Storefront. (Or follow along with the video at https://www.makeswift.com/components/nextjs/bigcommerce)

Once done in your https://app.makeswift.com/ go to Settings > Host > Site SPI Key under Host URL to fill in MAKESWIFT_SITE_API_KEY= in your .env.local file.


3. (Optional) Vscode setup
```bash
 cp .vscode/settings.example.json .vscode/settings.json
```

4. Run Catalyst!

```bash
pnpm run dev
```

This will run all packages and apps in watch mode. Default ports are listed below. If a port is unavailable, the next available port will be used. (For example, if `3000` is in use, `core` and `with-makeswift` will run on `3001` and `3002`, respectively) 
* Core Catalyst storefront: http://localhost:3000
* Experimental Makeswift-enabled storefront: http://localhost:3001
* Reactant Storybook: http://localhost:6006/
