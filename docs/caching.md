**Development**

# Caching

Catalyst leverages a variety of caching mechanisms available in Next.js, including request memoization, the Data Cache, and the Full Route Cache. These caching mechanisms are designed to enhance performance, minimize redundant requests, and reduce rendering costs.

## How Catalyst Uses Next.js Caching Features

- **Request Memoization**: Catalyst makes use of Next.js’s request memoization feature to ensure data is fetched only once during the React render cycle, even when requested multiple times within a component tree. This reduces unnecessary network requests and improves performance across your storefront. 
<!-- @todo explain how request memoization works with GQL POST requests -->

- **Data Cache**: Catalyst extends the native `fetch` API in Next.js to cache data across requests, ensuring your application can reuse cached data until it is explicitly revalidated or invalidated. This helps maintain faster response times while reducing the load on external APIs.

- **Full Route Cache**: Static routes in Catalyst are rendered and cached at build time, reducing the need for server-side rendering on each request. This enables faster page loads by serving cached HTML and React Server Component Payloads to users. Catalyst also supports dynamic rendering for routes that require fresh data on each request.

## Catalyst-Specific Caching Mechanisms

In addition to Next.js's built-in caching mechanisms, Catalyst introduces additional optimizations:

- **Middleware-Based Caching**: Catalyst employs custom middleware that detects requests lacking unique headers or query parameters (e.g., anonymous visitors or pages without personalized content). In these cases, the middleware redirects the request to a statically rendered version of the target page using `export const dynamic = 'force-static';`. This ensures that repeatable, non-unique requests benefit from the performance of static pages, further optimizing response times and reducing server load.

This combination of Next.js’s caching features and Catalyst-specific enhancements ensures that your storefront delivers a high-performance, efficient experience, while still allowing dynamic rendering when necessary.

<!-- @todo kv store in middleware -->
- Doesn't exist in Vercel, recommend enterprise users to use Upstash

<!-- @todo DEFAULT_REVALIDATE_TARGET -->
