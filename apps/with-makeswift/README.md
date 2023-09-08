# Catalyst with Makeswift

> [!WARNING]
> - The experimental `with-makeswift` version of Catalyst is a work in progress and not ready for feedback. During Catalyst’s Developer Preview, focus on the core Catalyst storefront features.

**Catalyst** is a composable, fully customizable headless storefront that offers a set of opinionated defaults. It is intended to fit the needs of modern developers, merchants, and shoppers. Catalyst is built with [Next.js (nextjs.org)](https://nextjs.org/) and uses our [React.js-based (react.dev)](https://react.dev/)**Reactant** storefront components.

This version of Catalyst uses [Makeswift](https://www.makeswift.com/) as an experimental low-code page builder.

To install Catalyst packages, configure environment variables, start the development server, and more, consult the [primary Catalyst README](https://github.com/bigcommerce/catalyst/blob/main/README.md).

## Create a Makeswift API key

Follow [Makeswift's text instructions (GitHub)](https://github.com/makeswift/makeswift/tree/main/examples/bigcommerce#visually-build-with-bigcommerce-components) or [video instructions (makeswift.com)](https://www.makeswift.com/components/nextjs/bigcommerce) to build and deploy a Makeswift integration with your Catalyst storefront. 

Next, locate the Makeswift API key in the [Makeswift app dashboard (makeswift.com)](https://app.makeswift.com/) by going to **Settings > Host > Site API Key**. Add the value to the `MAKESWIFT_SITE_API_KEY` variable in your `.env.local` file.

## Development notes

After you get the development server started, edit the rendered page by modifying `pages/index.tsx`. The server auto-reloads the browser page as you edit the file.

You can work with the BigCommerce GraphQL Storefront API at [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql), or edit this endpoint in `pages/api/graphql.ts`.

The `pages/api` directory maps to `/api/*`. Files in this directory are [Next.js API routes (nextjs.org)](https://nextjs.org/docs/api-routes/introduction), not React pages.

This project uses [next/font (nextjs.org)](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.
