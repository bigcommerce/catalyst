# AGENTS.md

## BigCommerce Catalyst Codebase Overview

This document provides guidance for Large Language Models (LLMs) working with the BigCommerce Catalyst codebase, focusing on the **Next.js App Router application** architecture, data fetching patterns, and key design principles.

**Catalyst is built as a Next.js App Router application** with React Server Components, enabling server-side data fetching, automatic code splitting, and optimal performance for e-commerce workloads.

## Repository Structure

The main Next.js application is located in the `/core` directory, which contains the complete e-commerce storefront implementation. Other packages exist outside of `/core` but are not the primary focus for most development work.

## Middleware Architecture

The application uses a composed middleware stack that significantly alters the default Next.js routing behavior. The middleware composition includes authentication, internationalization, analytics, channel handling, and most importantly, custom routing.

### Custom Routing with `with-routes` Middleware

The `with-routes` middleware is the most critical component that overrides Next.js's default path-based routing. Instead of relying on file-based routing, this middleware:

1. **Queries the BigCommerce GraphQL API** to resolve incoming URL paths to specific entity types (products, categories, brands, blog posts, pages).

2. **Rewrites requests** to internal Next.js routes based on the resolved entity type.

3. **Handles redirects** automatically based on BigCommerce's redirect configuration.

This means that URLs like `/my-product-name` can resolve to `/en/product/123` internally, providing flexible URL structure while maintaining SEO-friendly paths.

## Data Fetching and Partial Prerendering (PPR)

### PPR Configuration

The application uses Next.js Partial Prerendering with incremental adoption. This allows static parts of pages to be prerendered while dynamic content streams in.

### Streamable Pattern

The `Streamable<T>` pattern is a core architectural concept that enables efficient data streaming and React Server Component compatibility.

#### What is Streamable?

```typescript
export type Streamable<T> = T | Promise<T>;
```

A `Streamable<T>` represents data that can be either:
- **Immediate**: Already resolved data of type `T`
- **Deferred**: A Promise that will resolve to type `T`

#### Core Streamable API

Located in `core/vibes/soul/lib/streamable.tsx`, the Streamable system provides:

**`Streamable.from()`** - Creates a streamable from a lazy promise factory:
```typescript
const streamableProducts = Streamable.from(async () => {
  const customerToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();
  return getProducts(customerToken, currencyCode);
});
```

**`Streamable.all()`** - Combines multiple streamables with automatic caching:
```typescript
const combined = Streamable.all([
  streamableProducts,
  streamableCategories,
  streamableUser
]);
```

**`useStreamable()`** - Hook for consuming streamables in components:
```typescript
function MyComponent({ data }: { data: Streamable<Product[]> }) {
  const products = useStreamable(data);
  return <div>{products.map(...)}</div>;
}
```

**`<Stream>` Component** - Provides Suspense boundary for streamable data:
```tsx
<Stream value={streamableProducts} fallback={<ProductSkeleton />}>
  {(products) => <ProductList products={products} />}
</Stream>
```

#### Streamable Benefits

- **Performance**: Enables concurrent data fetching and streaming
- **Caching**: Automatic promise deduplication and stability
- **Flexibility**: Works with both sync and async data
- **Suspense Integration**: Built-in React Suspense support
- **Composition**: Easy chaining and combination of data sources

### Data Fetching Best Practices

1. **Use React's `cache()` function** for server-side data fetching to memoize function results and prevent repeated fetches or computations **per request** (React will invalidate the cache for all memoized functions for each server request).

2. **Implement proper cache strategies** based on whether user authentication is present.

3. **Leverage Streamable for progressive enhancement** where static content loads immediately and dynamic content streams in.

## GraphQL API Client

### Centralized Client Configuration

All interactions with the BigCommerce Storefront GraphQL API should use the centralized GraphQL client. This client provides:

- Automatic channel ID resolution based on locale
- Proper authentication token handling  
- Request/response logging in development
- Error handling with automatic auth redirects
- IP address forwarding for personalization

### Usage Pattern

Always import and use the configured client rather than making direct API calls. The client handles all the necessary headers, authentication, and channel context automatically.

## UI Design System (Vibes)

### Architecture Overview

The `vibes/` directory contains the **highly customizable and styleable UI layer** that is completely separate from data fetching and business logic. This separation enables:

- **Complete visual customization** without touching data logic
- **Theme-based styling** through CSS variables
- **Reusable components** across different page contexts
- **Clear separation of concerns** between data and presentation

### Vibes vs Pages Architecture

**`vibes/` folder**: Contains presentation components that are meant to be highly customizable and styleable to change the UI:
- Accept `Streamable<T>` data as props
- Handle rendering, styling, and user interactions
- Support theming through CSS variables
- No direct data fetching or business logic

**`page.tsx` files**: Where data fetching patterns should live:
- Handle authentication and authorization
- Create `Streamable` data sources
- Transform API responses for vibes components
- Manage routing and server-side logic

### Component Hierarchy

```
vibes/soul/
├── lib/
│   └── streamable.tsx     # Streamable utilities
├── primitives/           # Basic UI components
│   ├── button/
│   ├── product-card/
│   └── navigation/
└── sections/             # Complex UI sections
    ├── product-list/
    ├── featured-product-carousel/
    └── footer/
```

1. **Primitives** (`vibes/soul/primitives/`) - Basic reusable UI components like buttons, cards, forms.

2. **Sections** (`vibes/soul/sections/`) - Page-level components that compose primitives into complete page sections.

3. **Library** (`vibes/soul/lib/`) - Utility functions and patterns like the Streamable implementation.

### Data Flow Pattern

```
page.tsx → Streamable data → Vibes components → User interaction
```

**Example Pattern:**
```typescript
// app/[locale]/(default)/page.tsx - Data fetching
export default async function HomePage({ params }: Props) {
  const streamableProducts = Streamable.from(async () => {
    const customerToken = await getSessionCustomerAccessToken();
    return getProducts(customerToken);
  });

  return (
    <FeaturedProductList 
      products={streamableProducts} // Pass streamable to vibes
      title="Featured Products"
    />
  );
}

// vibes/soul/sections/featured-product-list/index.tsx - Presentation
export function FeaturedProductList({ 
  products, 
  title 
}: {
  products: Streamable<Product[]>; // Accept streamable
  title: string;
}) {
  return (
    <section>
      <h2>{title}</h2>
      <Stream value={products} fallback={<ProductSkeleton />}>
        {(productList) => (
          <div className="grid">
            {productList.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </Stream>
    </section>
  );
}
```

### Import Patterns

Components should be imported from the vibes design system using the `@/vibes/soul/` alias, maintaining clear separation between business logic in `/components` and design system components in `/vibes`.

## App Router Data Fetching Patterns

### Server Components by Default

All pages are React Server Components, enabling:
- Server-side data fetching with zero client JavaScript
- Automatic code splitting and optimization
- SEO-friendly content rendering
- Direct database/API access

### File-based Routing Structure

```
app/[locale]/(default)/
├── page.tsx              # Homepage with data fetching
├── layout.tsx            # Shared layout components
├── product/[slug]/
│   ├── page.tsx          # Product detail page
│   └── page-data.ts      # Product data fetching logic
├── category/[slug]/
│   └── page.tsx          # Category page
└── cart/
    └── page.tsx          # Cart page
```

### Data Fetching Example

```typescript
// page.tsx - Server Component with async data fetching
export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();
  
  // Create streamables for concurrent data loading
  const streamableProduct = Streamable.from(async () => {
    return getProduct(slug, customerAccessToken);
  });

  const streamableReviews = Streamable.from(async () => {
    const product = await streamableProduct; // Reuses cached promise
    return getProductReviews(product.id);
  });

  return (
    <ProductDetail 
      product={streamableProduct}
      reviews={streamableReviews}
    />
  );
}
```

## Key Architectural Principles

1. **App Router Architecture**: Built on Next.js App Router with React Server Components for optimal performance
2. **Routing Flexibility**: Unlike typical Next.js applications, URLs are resolved dynamically via GraphQL rather than file structure
3. **Progressive Enhancement**: Static content loads immediately with dynamic content streaming via PPR and Streamable
4. **Vibes Separation**: Complete separation between data fetching (`page.tsx`) and presentation (`vibes/`) concerns
5. **Centralized API Access**: All BigCommerce API interactions go through the configured GraphQL client
6. **Middleware-First**: Critical functionality like routing, auth, and internationalization handled at the middleware layer

## Notes

This codebase differs significantly from typical Next.js applications due to the custom routing middleware and e-commerce-specific patterns. The `with-routes` middleware essentially turns Next.js into a headless CMS router, where content structure is determined by the BigCommerce backend rather than the filesystem. Understanding this fundamental difference is crucial for working effectively with the codebase.

The Streamable pattern and PPR integration provide excellent user experience through progressive loading, but require understanding of React's newer concurrent features like the `use()` hook and Suspense boundaries.
