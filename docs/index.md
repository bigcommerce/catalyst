**Overview**
# Catalyst 

<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />

**Catalyst** is the composable, fully customizable headless ecommerce storefront framework for [BigCommerce](https://www.bigcommerce.com/). We've built Catalyst with [Next.js](https://nextjs.org/), [React](https://react.dev/) storefront components, and our [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

When you use Catalyst, you can create a fully functional storefront using our CLI and get to work without wiring up APIs or building ecommerce components from scratch that are optimized for SEO, accessibility, and performance. Catalyst is designed to take care of the essentials so you can focus your efforts on building your brand and adding those special features that take storefronts to the next level.

You can find a demo version of Catalyst at https://catalyst-demo.site/, hosted on Vercel in a US region.

## Ecommerce functionality

Catalyst has a production-ready business-to-consumer (B2C) ecommerce funnel, including the following features:

* Home page
* Faceted search on product listing pages (PLPs) which are dynamically created for each category and brand
* Full-text search 
* Product detail pages (PDPs) which are dynamically created for each product and published to the Catalyst storefront channel
* Shopping cart
* Secure redirected headless checkout page, which can be themed to match the styling of the core Catalyst storefront
* Order information for logged-in customers. This includes order history, order status, order details, tracking information, and tracking info and shipment addresses for each consignment


## Default state of Catalyst

Out-of-the-box, Catalyst has the following capabilities you can use to further build your storefront:

### Brand or retailer experience

* **Platform feature support**. Users' changes made from the BigCommerce store control panel or through APIs appear on the storefront as expected.
* **Complex catalog support**. Catalyst supports product catalogs of any size, complexity, or update frequency.

### Developer experience

* **Scalable GraphQL implementation**. Catalyst features scalable implementation of the GraphQL Storefront API.
* **Minimal infrastructure dependencies**. Catalyst can be deployed to any hosting provider that supports Node.js.
* **Making the most of modern Next.js features**. Catalyst uses [React server components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) and [Suspense](https://react.dev/reference/react/Suspense) boundaries in preparation for [partial pre-rendering](https://nextjs.org/learn/dashboard-app/partial-prerendering).
* **Components**. Catalyst provides _functionally_ complete ecommerce components and a pre-optimized site architecture for performance, SEO, and accessibility.
* **Unopinionated visual design**. Visually, Catalyst is a "blank sheet of paper" that's ready to be transformed into a stellar ecommerce brand. Catalyst components use [Tailwind CSS](https://tailwindcss.com/) to accelerate development.

### Shopper experience

* **Optimized shopping experiences**. Catalyst provides a guest shopper experience optimized for speed and supports the dynamic experiences that matter to logged-in customers.
* **Secure checkout**. Catalyst uses an optimized one-page redirected checkout on our hosted SaaS environment to simplify PCI compliance. By default, your headless storefront never collects or transmits personally identifiable information (PII) such as credit card numbers.

> [!NOTE]
> Customers have accounts on the store and can sign in to see orders, manage their accounts, and more.
> Shoppers browse the storefront but don't have accounts.

### Configuration recommendations

We expect you will prioritize some of these features over others as you make Catalyst your own. We recommend exploring the following configurations as you build:

* **A caching backend**. For example, using Vercel KV may improve the performance of our [with-routes middleware](/docs/catalyst-middleware.md).
* **Using microservices**. Externally hosted databases and third-party APIs can expand the feature set and data persistence available to Catalyst storefronts.
* **Evaluating middleware**. Assess the costs and benefits of the [default Catalyst middleware](/docs/catalyst-middleware.md). You may tailor the middleware for your use case or remove it altogether.
* **Additional catalog optimization**. You can tune Catalyst's performance based on your store's catalog size, complexity, and update frequency. For example, a catalog with a small number of products and infrequent updates may be able to take advantage of static generation, whereas a large catalog with frequent changes may lean into an aggressive caching strategy that relies on webhooks.

## Integrations

Native integrations developed for Catalyst are made available as Git patches that the Catalyst CLI can automatically apply to your newly created storefront.

In order to create your Catalyst storefront with an out-of-the-box integration, run:

```bash
pnpm create @bigcommerce/catalyst@latest --integration=<integration-name>
```

Replace `<integration-name>` with the name of a folder inside the `integrations` directory of the Catalyst monorepo: https://github.com/bigcommerce/catalyst/tree/main/integrations

For example, you can create a Catalyst storefront with the Makeswift integration by running:

```bash
pnpm create @bigcommerce/catalyst@latest --integration=makeswift
```

### Developing a native integration for Catalyst

We support and encourage any third-party contributions for Catalyst, especially those introducing new integrations, or improving existing integrations. 

At a high level, developing an integration for Catalyst typically involves the steps listed below:

#### 1. Fork the Catalyst Monorepo

Begin by forking the [`bigcommerce/catalyst` repository](https://github.com/bigcommerce/catalyst), clone the fork locally, and [follow the steps to get started with local monorepo development](https://www.catalyst.dev/docs/monorepo).

#### 2. Create a Branch to Build Your Integration

Next, create a branch based off the latest `@bigcommerce/catalyst-core` release tag and name it following the convention `integrations/your-integration-name`. This branch is where you'll be building your integration into Catalyst, and the naming convention helps us organize all integration branches inside the Catalyst monorepo.

```bash
git checkout -b integrations/your-integration-name @bigcommerce/catalyst-core@X.X.X
```

All integrations should be based off the latest `@bigcommerce/catalyst-core` release tag. This is because new Catalyst projects are created based off that tag, and if your integration is compatible with the latest tag, then it will be compatible with all Catalyst projects created from that tag.

> [!IMPORTANT]
>
> #### Things to consider when building integrations:
>
> - In order to ensure your integration applies cleanly to new Catalyst projects, your integration should be 100% contained within the `core` folder of the monorepo. With the exception of installing packages inside of `core` (which in turn modifies the root `pnpm-lock.yaml` file), none of your integration code should live outside of the `core` folder.
> - If your integration requires environment variables to work, be sure to add those environment variables to `core/.env.example`. This allows the `integrate` CLI to track which environment variables are required for the integration to work.

#### 3. Create a Patch and Manifest File from Your Integration Branch

When you've finished building your integration, commit your changes to the branch, and then run the following command:

```bash
pnpm create @bigcommerce/catalyst@latest integration your-integration-name
```

#### 4. Open a PR with the Generated Patch and Manifest Files Only

The command above will create a new folder in your working tree called `integrations/your-integration-name/` with two files: `integration.patch` and `manifest.json`. You'll want to create a PR to merge just this created folder into `main`:

```bash
git checkout main &&
git checkout -b integrations/your-integration-name-patch
```

Once that branch is created, commit your changes, push it to your fork, and open a pull request from your remote branch into `bigcommerce/catalyst:main`. Once your branch is merged into main, the CLI will register your new integration for users to choose from when creating a new Catalyst project.


## Future releases

Over time, we plan to expand Catalyst to include all our default storefront features, including feature parity with our fully hosted [Stencil storefront platform](https://developer.bigcommerce.com/docs/storefront/stencil).

Future releases of Catalyst will expand our feature set to include full coverage of customer-specific features, including price lists, customer groups, and checkout for logged-in customers. We are currently prioritizing the logged-in Customer **My Account** area, including but not limited to order history, customer profiles, etc.

We plan to add full support for B2B Edition in a future release.

We are also targeting improvements for brands and retailers who sell cross-border, such as language localization and currency features.

We welcome feedback in [GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions) on how we should prioritize these enhancements, where we will provide a public view of our roadmap.

## Resources

* [🚀 catalyst.dev](https://www.catalyst.dev)
* [🤗 BigCommerce Developer Community](https://developer.bigcommerce.com/community)
* [💬 GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions)
* [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
* [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
* [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
