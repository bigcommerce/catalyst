## Frequently Asked Questions

### Where can I see a demo of Catalyst?
https://catalyst-demo.site/ is a hosted demo version of Catalyst, hosted on Vercel in the US.

### What e-commerce functionality is currently available in Catalyst? How complete is it?

Catalyst has a basic B2C e-commerce purchase funnel, inclusive of a Home Page, PLPs with faceted search (dynamically created for the Categories and Brands in the BigCommerce store), Textual search, PDPs dynamically created for each Product published to the Catalyst storefront channel, a shopping cart, and a redirected headless checkout. All of these things work in a production-ready capacity out of the box.

### What new features can I expect in Catalyst?

Future releases of Catalyst will expand our feature set to include full coverage of all the Customer-specific features such as Price Lists, Customer Group functionality, and checking out as a logged-in Customer.

We plan to add full support for B2B Edition in a future release.

Over time, we will expand the feature coverage to include all the features of our fully-hosted [Stencil storefront platform](https://developer.bigcommerce.com/docs/storefront/stencil) - in other words, all of our default storefront functionality. We are currently prioritizing the logged-in Customer "My Account" area, inclusive of order history, customer profile, and so forth - as well as improvements targeted at merchants selling cross-border, such as localizations.

We welcome feedback in [GitHub Discussions](https://github.com/bigcommerce/catalyst/discussions) on how we should prioritize these enhancements, and we wish to provide a public view into our roadmap in that space.

### What assumptions are baked into the default state of Catalyst, and how should I modify it for my needs?

The out-of-the-box state of Catalyst is meant to be one-size-fits-all, and is focused on:

- Minimizing infrastructure dependencies (only Next.js hosting is required)
- Supporting as much of the BigCommerce platform functionality as possible, such that users of the BigCommerce Control Panel and Admin APIs have their actions in the control panel reflected as they expect on the storefront
- Providing _functionally_ complete e-commerce components and functionality that is pre-optimized for Performance, SEO, and Accessibility
- Having a completely unopinionated visual design, which should be thought of as a "blank sheet of paper" ready to be themed and turned into a real e-commerce brand, without any need to tear anything down (and with a strong foundation in Tailwind styles to make styling easy)
- Demonstrating responsible and scalable use of the BigCommerce GraphQL Storefront API for the headless storefront use case
- Providing a redirected checkout on our hosted SaaS environment to simplify PCI compliance by making sure sensitive information like a credit card number is never transmitted through your headless storefront
- Supporting product catalogs of any size, complexity, and rate of update
- Providing a very fast & optimized experience for guest shoppers, while supporting the dynamic functionality that affects the experience of a logged-in Customer
- Making the most of modern Next.js features such as [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) and [Suspense](https://react.dev/reference/react/Suspense) boundaries (in preparation for [Partial Pre-Rendering](https://nextjs.org/learn/dashboard-app/partial-prerendering))

We expect that on a case-by-case basis, you will choose to diverge from these assumptions and customize Catalyst to meet your needs, especially in terms of visual appearance.

Some recommended configurations to investigate include:

- Implementing a caching backend such as Vercel KV to improve the performance of our [with-routes middleware](/docs/middleware)
- Considering if you need the benefits of the middleware at all, or if you can remove it or customize it for your needs
- Implementing additional data persistence, databases, and 3rd-party APIs to extend Catalyst with custom functionality
- Tuning the performance of Catalyst based on your own understanding of your catalog, size, and complexity
    - For example, a catalog with a small number of products and a low rate of update may be able to take more advantage of static generation than a large catalog that changes frequently