# Caching

Catalyst uses several caching mechanisms in Next.js, including request memoization, the Data Cache, and the Full Route Cache. These are designed to improve performance, reduce redundant requests, and lower rendering costs. For more details, check out the [Caching documentation](https://nextjs.org/docs/app/building-your-application/caching) on Next.js.

## How Catalyst Uses Next.js Caching Features

### Request Memoization

Catalyst utilizes Next.js’s [request memoization](https://nextjs.org/docs/app/building-your-application/caching#request-memoization) to ensure data is fetched once during the React render cycle, even if requested multiple times within the component tree. This reduces unnecessary network requests, improving performance across your storefront.

For pages that need the same information for both metadata and content, we wrap async functions with the `cache` utility. This memoizes the result and returns the cached value on subsequent calls. This function is used in both the Page or Layout server component and the [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function) function, ensuring data is fetched only once during the render cycle.

### Data Cache

Next.js extends the native `fetch` API to cache data across requests, allowing cached data reuse until it's invalidated. This ensures faster response times and reduces the load on external APIs, like BigCommerce.

For data that is not customer-specific, we usually apply a default caching strategy of 1 hour, adjustable via the `revalidate` property in the `fetch` function. Most functions use a value based on the `DEFAULT_REVALIDATE_TARGET` environment variable. Adjust this value depending on your store's needs. Here’s a recommendation guide:

| Traffic | Product/Category Updates | Recommendation |
| --- | --- | --- |
| High | High | 1-8 hours |
| High | Low | 8-24 hours |
| Low | High | 1-8 hours |
| Low | Low | 24-48 hours |

> [!CAUTION]
> The lower the `DEFAULT_REVALIDATE_TARGET`, the more requests your store will make to the BigCommerce API, leading to rate limiting and increased costs. Monitor API usage and adjust the `DEFAULT_REVALIDATE_TARGET` accordingly.

### Full Route Cache

Static routes in Catalyst can be rendered and cached at both build and runtime, reducing server-side rendering on each request. This provides faster page loads by serving cached HTML and React Server Component Payloads. Catalyst supports dynamic rendering for routes needing fresh data on each request.

## Catalyst-Specific Caching Mechanisms

In addition to Next.js's built-in caching, Catalyst offers further optimizations:

### Guest vs. Logged-in Customer Caching

Catalyst includes paths containing a `/static/page.tsx` file with `export const dynamic = 'force-static';` for generating static pages at build time for guest shoppers. These static pages are periodically rebuilt using [Incremental Static Regeneration (ISR)](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration), without requiring a re-build of the entire storefront. The revalidation period is controlled by the same `DEFAULT_REVALIDATE_TARGET` environment variable as the Data Cache.

- **Guest shoppers**: Requests are rewritten to statically built pages for better performance. Pages are periodically rebuilt using ISR.
- **Logged-in customers**: Dynamic rendering is used, and requests are rewritten to the regular path (`/page.tsx`).

This setup ensures non-unique, repeatable requests benefit from the performance of static pages while maintaining dynamic rendering when necessary.

### Rate Limiting

BigCommerce GraphQL mutations are rate-limited by the request IP. Catalyst adds the shopper’s IP address to the request headers when a `fetch` request has a `cache` value of `no-store` or `no-cache`. This helps prevent rate limiting and ensures your store can handle high traffic.
