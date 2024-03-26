**Overview**
# Middleware

Catalyst uses [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) to support the following features.

## With auth

The `with-auth` middleware is a wrapper over a minimal implementation of [Auth.js, formerly NextAuth.js](https://authjs.dev/reference). This provides Catalyst with session management for shoppers' carts and customers' logged-in states. By default, it uses JWT cookies to avoid obligatory dependency on any persistence layer on the storefront itself. You may wish to extend this functionality to store more information in a session or add a persistence layer yourself for more flexibility and control over shopper sessions.

## With routes

The `with-routes` middleware overrides the default [Next.js file-based routing behavior](https://nextjs.org/docs/app/building-your-application/routing) to provide support for certain BigCommerce features in a way that allows changes users make with the store control panel and APIs to have the expected effect on the storefront.

This middleware sends a relative path to BigCommerce using GraphQL Storefront API's [route() node](https://github.com/bigcommerce/catalyst/blob/main/apps/core/client/queries/get-route.ts) to determine the platform entity, such as a product, that correlates with the supplied path.

The `with-routes` middleware then performs an internal Next.js rewrite to render at the supplied path the page that corresponds with the brand, category, cart, etc., that is configured for that `entityId`.

The net effect is to provide full freedom for the custom URL configuration BigCommerce provides, which does not force brand, category, etc. pages to have any particular programmatic URL path. For example, rather than being constrained to render the `shoes` and `high-tops` categories at `/category/shoes` and `/category/high-tops`, you can choose alternative taxonomies, such as `/shoes/all` and `/shoes/high-tops`.

This ensures that any URL assigned to an object's [node](https://developer.bigcommerce.com/graphql-storefront/reference#definition-Node) using either the store control panel or APIs works as expected on the Catalyst storefront, including [301 redirects](https://support.bigcommerce.com/s/article/MSF-301-Redirects#adding).

The `with-routes` middleware also checks the [storefront status](https://developer.bigcommerce.com/graphql-storefront/reference#definition-StorefrontStatusType) so that when a control panel or API user takes a storefront down for **MAINTENANCE** or sets it to **LAUNCHED**, the live storefront reflects the change without waiting for a rebuild of the Next.js application.

### Tradeoffs

The tradeoff is that this is a blocking API request required to render site pages, which has a performance penalty. Path-entity relationships are very cacheable, but Next.js middleware cannot use typical `cache()` functionality, so you must use an alternative caching backend. Currently, we have a [caching implementation](https://github.com/bigcommerce/catalyst/tree/main/apps/core/lib/kv) that uses [Vercel KV](https://vercel.com/docs/storage/vercel-kv) and is automatically enabled when you connect a Vercel KV instance to a Catalyst storefront. We plan to support other caching backends in future releases, such as a generic adapter for traditional Redis backends.

Suppose you don't want to use the control panel or API-configured URLs on your Catalyst storefront and don't want to support storefront status checks. In that case, you can remove the `with-routes` middleware and gain a performance improvement.

For linking purposes, you may want to tightly control your URLs such that they are known in advance at build time, or engineer routing solutions in other ways.
