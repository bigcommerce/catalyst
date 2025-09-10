# Catalyst + B2B + Makeswift

This branch is intended to be used as a template/starting point for new Catalyst projects that require B2B and Makeswift functionality.

> [!CAUTION]
> **THIS TEMPLATE IS IN ALPHA**

## Getting Started

**Requirements:**

- A [BigCommerce account](https://www.bigcommerce.com/start-your-trial)
- A BigCommerce store with B2B Edition enabled, and a Catalyst channel created via [One-Click Catalyst](https://developer.bigcommerce.com/docs/storefront/catalyst/getting-started)
- Node.js version 22
- Corepack-enabled `pnpm`

  ```bash
  corepack enable pnpm
  ```

1. Clone this repository

2. Initialize your environment variables

   ```bash
   pnpm dlx @bigcommerce/create-catalyst@latest init
   ```

3. Fill in any missing environment variables, such as `B2B_API_HOST` and `B2B_API_TOKEN` from `.env.example` into `.env.local`

Learn more about Catalyst at [catalyst.dev](https://catalyst.dev).

## Resources

- [Catalyst Documentation](https://catalyst.dev/docs/)
- [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
- [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
- [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
