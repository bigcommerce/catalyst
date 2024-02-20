## Middlewares

Catalyst uses [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware) to support certain features detailed below.

### `with-routes`

The `with-routes` middleware overrides default [Next.js file-based routing behavior](https://nextjs.org/docs/app/building-your-application/routing) to provide support for certain BigCommerce features in a way that allows the BigCommerce Control Panel and APIs to have the expected effect on the storefront.

This middleware uses a [query](https://github.com/bigcommerce/catalyst/blob/main/apps/core/client/queries/get-route.ts) to the GraphQL Storefront API's [route() node](https://developer.bigcommerce.com/graphql-storefront/reference#definition-Route) to ask BigCommerce which entity lives on a particular URL path and performs an internal Next.js rewrite to the correct templated page for that entity + ID. This allows full support for URL capabilities in BigCommerce, in which any entity can live on any URL, and there are no guarantees of particular entities being prefixed with a URL path that clarifies what type of entity they are.

This ensures that any URL assigned to an object with the BigCommerce Control Panel or APIs will work as expected on the Catalyst storefront.

The tradeoff is that this is a required, blocking network request to check which object lives on a given URL path, which has a performance penalty. This information is very cacheable, but Next.js middleware cannot use typical `cache()` functionality so we must use an alternative caching backend for this. Currently, we have an [implementation](https://github.com/bigcommerce/catalyst/tree/main/apps/core/lib/kv) which works with [Vercel KV](https://vercel.com/docs/storage/vercel-kv) and is automatically enabled when a Vercel KV instance is connected to a Catalyst storefront. We plan to support other caching backends in future releases, such as a generic adapter for traditional Redis backends.

The `with-routes` middleware _also_ checks the [Storefront Status](https://developer.bigcommerce.com/graphql-storefront/reference#definition-StorefrontStatusType) so that a Control Panel or API user can take a storefront "down for maintenance" and have this quickly reflect on the live website without a rebuild of the Next.js application.

If your particular implementation doesn't care about the BigCommerce store data being authoritative for URLs, and you are able to tightly control your URLs such that they are known in advance at build time or solve this problem of routing in other ways, and if you also don't care to have support for Storefront Status, this middleware can be removed which will result in a performance improvement.

### `with-auth`

The `with-auth` middleware is a wrapper over a simple implementation of [Auth.js (formerly NextAuth.js)](https://authjs.dev/reference). This provides Catalyst with session management for shopper's carts as well as the logged-in state of Customers, and by default uses JWT cookies in order to avoid any dependency on any persistence layer within Catalyst in order for it to function. You may wish to extend this functionality to store more information against a session, or add a persistence layer for more flexibility around shopper sessions.