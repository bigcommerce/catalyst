# Catalyst

Catalyst is the next generation of storefronts at BigCommerce. It aims to be composable and powerful to meet the needs of our enterprise customers, exceeding performance of Stencil and Blueprint themes. Catalyst is built with [Next.js](https://nextjs.org/) using our React.js storefront component library.

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

Update `.env.local` with your access-token, store-hash and channel-id.

For a list of recommended scopes to use for your access token, please expand the table below.

<details>
  <summary>Expand</summary>

| Scope                                        | Permission Level |
| -------------------------------------------- | ---------------- |
| Content                                      | `read-only`      |
| Checkout Content                             | `None`           |
| Customers                                    | `read-only`      |
| Customers Login                              | `login`          |
| Information & Settings                       | `read-only`      |
| Marketing                                    | `read-only`      |
| Orders                                       | `read-only`      |
| Order Transactions                           | `read-only`      |
| Create Payments                              | `None`           |
| Get Payment Methods                          | `read-only`      |
| Stored Payment Instruments                   | `read-only`      |
| Products                                     | `read-only`      |
| Themes                                       | `read-only`      |
| Carts                                        | `read-only`      |
| Checkouts                                    | `read-only`      |
| Sites & Routes                               | `read-only`      |
| Channel Settings                             | `None`           |
| Channel Listings                             | `None`           |
| Storefront API Tokens                        | `None`           |
| Storefront API Customer Impersonation Tokens | `manage`         |
| Store Logs                                   | `None`           |
| Store Locations                              | `read-only`      |
| Store Inventory                              | `read-only`      |
| Fulfillment Methods                          | `None`           |
| Order Fulfillment                            | `None`           |

</details>

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
