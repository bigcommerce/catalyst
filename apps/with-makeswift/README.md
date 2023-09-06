# Catalyst

---

:warning: Notice

The experimental `with-makeswift` version of Catalyst is not quite ready for feedback. During Catalyst’s developer preview you should be focused on the core Catalyst storefront.

---

A fully customizable headless storefront, Catalyst offers a set of opinionated defaults, while being composable to fit the needs of the developer, merchant, and shopper. Catalyst is built with [Next.js](https://nextjs.org/) and [Makeswift](https://www.makeswift.com/) using our React.js storefront component library called Reactant.

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

---

:warning: Notice

The experimental `with-makeswift` version of Catalyst is not ready and users should focus on the core product only. While we are not looking for feedback yet with the experimental `with-makeswift` version of Catalyst, the following onboarding instructions are if users want to experiment with the current state of the experimental `with-makeswift` version of Catalyst. During Developer Preview you should be looking at Core.

---

Follow the instructions at https://github.com/makeswift/makeswift/tree/main/examples/bigcommerce#visually-build-with-bigcommerce-components to build and deploy a MakeSwift integration with your BigCommerce Storefront. (Or follow along with the video at https://www.makeswift.com/components/nextjs/bigcommerce)

Once done in your https://app.makeswift.com/ go to Settings > Host > Site SPI Key under Host URL to fill in MAKESWIFT_SITE_API_KEY= in your .env.local file.

3. Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql). This endpoint can be edited in `pages/api/graphql.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
