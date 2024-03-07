**Overview**
# Catalyst 

<a href="https://catalyst.dev" target="_blank" rel="noopener norerrer">
  <img src="https://storage.googleapis.com/bigcommerce-developers/images/catalyst_readme_banner.png" alt="Catalyst for Composable Commerce Image Banner" title="Catalyst">
</a>

<br />

**Catalyst** is the composable, fully customizable headless ecommerce storefront framework for [BigCommerce](https://www.bigcommerce.com/). We've built Catalyst with [Next.js](https://nextjs.org/), [React](https://react.dev/) storefront components, and our [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql).

When you use Catalyst, you can spin up a fully functional storefront using our CLI and get to work without wiring up APIs or building ecommerce components from scratch that are optimized for SEO, accessibility, and performance. Catalyst is designed to take care of the essentials so you can focus your efforts on building your brand and adding those special features that take storefronts to the next level.

You can find a demo version of Catalyst at https://catalyst-demo.site/, hosted on Vercel in a US region.

## Ecommerce functionality

Catalyst has a basic B2C ecommerce purchase funnel, including the following. These pages and features are production-ready.

* Home page
* Faceted search on product listing pages, or _PLPs_, which are dynamically created for each category and brand
* Textual search
* Product detail pages, or _PDPs_, which are dynamically created for each product and published to the Catalyst storefront channel
* Shopping cart
* Secure redirected headless checkout page, which can be themed to match the styling of the core Catalyst storefront


## Default state of Catalyst

Out-of-the-box, Catalyst has the following capabilities you can use to further build your storefront:

### Brand or retailer experience

* **Platform feature support**. Changes that users make with the store control panel, Management APIs, and GraphQL Admin API should appear on the storefront as they expect.
* **Complex catalog support**. Catalyst supports product catalogs of any size, complexity, or update frequency.

### Developer experience

* **Scalable GraphQL implementation**. Catalyst models responsible, scalable implementation of the GraphQL Storefront API in headless storefront use cases.
* **Minimal infrastructure dependencies**. Catalyst only requires Next.js hosting.
* **Making the most of modern Next.js features**. Catalyst uses [React server components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) and [Suspense](https://react.dev/reference/react/Suspense) boundaries, in preparation for [partial pre-rendering](https://nextjs.org/learn/dashboard-app/partial-prerendering).
* **Components**. Providing _functionally_ complete ecommerce components and a site architecture that's pre-optimized for performance, SEO, and accessibility.
* **Unopinionated visual design**. Visually, Catalyst is a "blank sheet of paper" that's ready to be transformed into a stellar ecommerce brand. To accelerate your work, the default components use the [Tailwind CSS](https://tailwindcss.com/) framework.

### Shopper experience

* **Optimized shopping experiences**. Catalyst provides a very fast and optimized experience for guest shoppers and supports the dynamic experiences that matter to logged-in customers.
* **Secure checkout**. Catalyst uses an optimized one-page redirected checkout on our hosted SaaS environment to simplify PCI compliance. By default, your headless storefront never collects or transmits personally identifiable information, or _PII_, such as credit card numbers.

> [!NOTE]
> Customers have accounts on the store and can sign in to see orders, manage their accounts, etc.
> Shoppers browse the storefront, but don't have accounts.

### Configuration recommendations

We expect that you will prioritize some of these features over others as you make Catalyst your own. We recommend exploring the following configurations as you build:

* **A caching backend**. For example, using Vercel KV may improve the performance of our [with-routes middleware](/docs/middleware).
* **Using microservices**. Externally hosted databases and third-party APIs can expand the feature set and data persistence available to Catalyst storefronts.
* **Evaluating middleware**. Assess the costs and benefits of the [default Catalyst middleware](/docs/middleware). You may choose to tailor the middleware for your use case, or remove it altogether.
* **Additional catalog optimization**. You can tune the performance of Catalyst based on your insights into the store's catalog size, complexity, and update frequency. For example, a catalog with a small number of products and infrequent updates may be able to take advantage of static generation, whereas a large catalog that has frequent changes may lean into an aggressive caching strategy that relies on webhooks.

## Future releases

Over time, we plan to expand Catalyst to include all our default storefront features, including feature parity with our fully-hosted [Stencil storefront platform](https://developer.bigcommerce.com/docs/storefront/stencil).

Future releases of Catalyst will expand our feature set to include full coverage of customer-specific features, including price lists, customer groups, and checkout for logged-in customers. We are currently prioritizing the logged-in Customer **My Account** area, including but not limited to order history, customer profiles, etc.

We plan to add full support for B2B Edition in a future release.

We are also targeting improvements for brands and retailers who sell cross-border, such as language localization and currency features.

We welcome feedback in [GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions) on how we should prioritize these enhancements, where we will provide a public view into our roadmap.

## Resources

* [🚀 catalyst.dev](https://www.catalyst.dev)
* [🤗 BigCommerce Developer Community](https://developer.bigcommerce.com/community)
* [💬 GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions)
* [GraphQL Storefront API Playground](https://developer.bigcommerce.com/graphql-storefront/playground)
* [GraphQL Storefront API Explorer](https://developer.bigcommerce.com/graphql-storefront/explorer)
* [BigCommerce DevDocs](https://developer.bigcommerce.com/docs/build)
