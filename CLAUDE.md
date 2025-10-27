# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Catalyst is BigCommerce's composable headless commerce framework built with Next.js 15, React 19, and the GraphQL Storefront API. This is a pnpm workspace monorepo with:

- `/core` - The main Next.js storefront application (reference implementation)
- `/packages/*` - Shared packages and tooling

## Requirements

- Node.js version 20 or 22
- Corepack-enabled pnpm: `corepack enable pnpm`
- BigCommerce account with API credentials configured in `.env.local`

## Essential Commands

### Development
```bash
# Install dependencies
pnpm install

# Run dev server (generates GraphQL schema, then starts Next.js)
pnpm run dev

# Run dev server from core/ directory
cd core && pnpm run dev
```

### Building and Testing
```bash
# Build entire monorepo
pnpm run build

# Build specific package
pnpm --filter @bigcommerce/catalyst-core build

# Type check
pnpm run typecheck

# Lint
pnpm run lint

# Run tests
pnpm run test

# Analyze bundle (from core/)
cd core && pnpm run build:analyze
```

### GraphQL Schema Generation
```bash
# Regenerate GraphQL types from BigCommerce API (from core/)
cd core && pnpm run generate
```

This fetches the latest schema and generates `bigcommerce.graphql` and `bigcommerce-graphql.d.ts`. Run this when BigCommerce API changes or when GraphQL queries show type errors.

### Running Single Test
```bash
# Playwright tests (from core/)
cd core && pnpm exec playwright test tests/specific-test.spec.ts

# With UI
cd core && pnpm exec playwright test --ui
```

## Monorepo Architecture

**Workspace Structure:**
- Uses pnpm workspaces defined in `pnpm-workspace.yaml`
- Turborepo orchestrates builds with dependency graph (`turbo.json`)
- Packages linked via `workspace:^` protocol

**Key Packages:**
- `@bigcommerce/catalyst-client` - GraphQL client for BigCommerce API
- `@bigcommerce/create-catalyst` - CLI for scaffolding new projects
- `@bigcommerce/catalyst` - Additional CLI tooling and deployment utilities
- `@bigcommerce/eslint-config-catalyst` - Shared ESLint configuration

**Build Orchestration:**
- Turbo caches builds and respects dependency order
- `build` task depends on `^build` (builds dependencies first)
- `lint` depends on `^build` (requires built packages)
- `topo` task establishes topological dependency order

## Core Application Structure

The `/core` directory contains the main Next.js application:

**Critical Directories:**
- `app/[locale]/` - Next.js App Router with internationalized routing
- `client/` - GraphQL client setup, fragments, utilities
- `auth/` - NextAuth.js v5 integration for customer authentication
- `components/` - Reusable React components
- `lib/` - Utilities (cart operations, analytics, KV storage, formatting)
- `i18n/` - Internationalization config and message files
- `middlewares/` - Composable Next.js middleware layers
- `data-transformers/` - Convert GraphQL responses to UI-friendly formats
- `build-config/` - Build-time configuration fetched from BigCommerce

## GraphQL Pattern with gql.tada

**Type-Safe GraphQL:** This project uses `gql.tada` for compile-time type checking of GraphQL queries.

**Creating Queries:**
```typescript
import { graphql } from '~/client/graphql';

const ProductQuery = graphql(`
  query Product($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        entityId
        name
      }
    }
  }
`);
```

**Fragment Composition:**
```typescript
// Define fragment near component
export const ProductOptionsFragment = graphql(`
  fragment ProductOptionsFragment on Product {
    productOptions {
      __typename
      entityId
      displayName
    }
  }
`);

// Use in query with array syntax
const ProductQuery = graphql(`
  query Product($entityId: Int!) {
    site {
      product(entityId: $entityId) {
        ...ProductOptionsFragment
      }
    }
  }
`, [ProductOptionsFragment]);
```

**Data Fetching Pattern:**
```typescript
import { cache } from 'react';
import { client } from '~/client';

export const getProduct = cache(async (entityId: number) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: ProductQuery,
    variables: { entityId },
    customerAccessToken,
    fetchOptions: customerAccessToken
      ? { cache: 'no-store' }
      : { next: { revalidate: 3600 } },
  });

  return data.site.product;
});
```

**Key Patterns:**
- Wrap data fetchers in React `cache()` to deduplicate requests within render cycle
- Use `customerAccessToken` for authenticated requests (always `cache: 'no-store'`)
- Use `next.revalidate` for public data
- Import client from `~/client` (configured with locale/channel resolution)

## Authentication System

**NextAuth.js v5** powers customer authentication:

- **Two auth methods:** Password-based and JWT-based (for SSO/impersonation)
- **Session strategy:** JWT stored in HTTP-only cookies
- **Anonymous sessions:** Separate system for guest cart tracking

**Key Functions:**
```typescript
import { getSessionCustomerAccessToken, isLoggedIn } from '~/auth';

// Get customer access token for API calls
const token = await getSessionCustomerAccessToken();

// Check authentication
if (await isLoggedIn()) {
  // ...
}
```

**Cart Handling:**
- Cart merging happens automatically on login
- Cart ID stored in session (authenticated) or anonymous session (guest)
- Use `lib/cart/` utilities for cart operations

## Internationalization

**next-intl** handles i18n with locale-based routing:

- Locale prefix strategy: `as-needed` (default locale has no prefix)
- Messages: `/core/messages/{locale}.json`
- Configuration: `/core/i18n/`

**Multi-Channel Support:**
- `/core/channels.config.ts` maps locales to BigCommerce channel IDs
- Each locale can represent a different storefront
- Client automatically resolves channel based on request locale

**Navigation:**
```typescript
// Use i18n-aware navigation utilities
import { Link, redirect, useRouter, usePathname } from '~/i18n/routing';

// These automatically handle locale prefixes
<Link href="/product/123">Product</Link>
```

## Middleware System

**Composable Middleware Layers** (executed in order):

1. **withAuth** - Session validation and refresh
2. **withIntl** - Locale detection and routing
3. **withAnalyticsCookies** - Analytics tracking
4. **withChannelId** - Resolve BigCommerce channel from locale
5. **withRoutes** - Dynamic route resolution and rewrites

**withRoutes Middleware:**
The most complex layer - handles:
- Queries BigCommerce for route data (products, categories, brands, pages)
- Rewrites clean URLs (`/my-product`) to internal routes (`/[locale]/product/[slug]`)
- Caches route data in KV store (30 min TTL, stale-while-revalidate)
- Returns 301 redirects from BigCommerce redirect API
- Checks store status (maintenance mode)

**Route Caching:**
- Memory cache + distributed cache (Upstash Redis or Vercel KV)
- Configure via `ENABLE_CACHE` and KV environment variables
- Fallback to memory-only if no KV configured

## Data Transformation Pattern

**Location:** `/core/data-transformers/`

**Purpose:** Convert GraphQL responses to UI component props

**Example:**
```typescript
// transforms/product-options-transformer.ts
export const transformProductOptions = (options: ProductOptions[]) => {
  return options.map(option => ({
    type: option.__typename === 'MultipleChoiceOption' ? 'select' : 'text',
    label: option.displayName,
    required: option.isRequired,
    // ... UI-specific mapping
  }));
};
```

Use transformers to keep components decoupled from GraphQL schema changes.

## Revalidation Strategy

**Tag-Based Revalidation:**
```typescript
import { revalidateTag } from 'next/cache';
import { TAGS } from '~/client/revalidation-targets';

// After mutation
revalidateTag(TAGS.cart);
revalidateTag(TAGS.customer);
```

**Available Tags:** Defined in `/core/client/revalidation-targets.ts`

**Newer Pattern (unstable):**
```typescript
import { unstable_expireTag } from 'next/cache';

unstable_expireTag(TAGS.cart);
```

## Server Actions

**Pattern for Mutations:**

```typescript
'use server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { revalidateTag, TAGS } from '~/client/revalidation-targets';

export async function addToCart(formData: FormData) {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: AddToCartMutation,
    variables: { /* ... */ },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  revalidateTag(TAGS.cart);

  return { success: true };
}
```

**Key Points:**
- Always use `'use server'` directive
- Always use `cache: 'no-store'` for mutations
- Include `customerAccessToken` for authenticated operations
- Revalidate appropriate tags after mutations

## Environment Configuration

**Required Variables:**
See `.env.example` in core/ for full list. Critical ones:

- `BIGCOMMERCE_STORE_HASH` - Store identifier
- `BIGCOMMERCE_ACCESS_TOKEN` - API token
- `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN` - For customer login
- `AUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `CLIENT_ID`, `CLIENT_SECRET` - For admin API access

**Optional:**
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` - Upstash Redis
- `SEGMENT_WRITE_KEY` - Analytics
- `ENABLE_CACHE` - Route caching toggle

## Component Patterns

**Server Components by Default:**
- Keep components as server components unless client interactivity needed
- Use `'use client'` only when necessary (hooks, event handlers, browser APIs)

**Client Components:**
```typescript
'use client';

import { useState } from 'react';

export function InteractiveComponent() {
  const [state, setState] = useState();
  // ...
}
```

**Composition:**
- Pass server-fetched data to client components as props
- Avoid fetching in client components when possible

## Common Development Patterns

### Adding a New Page
1. Create route in `app/[locale]/(default)/your-route/page.tsx`
2. Create `page-data.ts` for data fetching
3. Use `getTranslations()` for i18n
4. Define metadata in `generateMetadata()` export

### Adding GraphQL Query
1. Write query with `graphql()` function
2. Define fragments near components that use them
3. Compose fragments in queries with array syntax
4. Wrap fetcher in `cache()` for deduplication
5. If schema changes, run `pnpm run generate` from core/

### Adding Server Action
1. Create `_actions/` directory in route
2. Add `'use server'` directive
3. Use conform + zod for form validation
4. Revalidate tags after mutations
5. Return success/error state

### Working with Cart
```typescript
import { getCart } from '~/client/queries/get-cart';
import { addToOrCreateCart } from '~/lib/cart';

// Get current cart
const cart = await getCart();

// Add item
await addToOrCreateCart({ productEntityId, variantEntityId });
```

## Testing

**Playwright Tests:**
- Located in `/core/tests/`
- E2E tests for critical user flows
- Run with `cd core && pnpm exec playwright test`

**Visual Tests:**
- Lighthouse CI runs on PRs (see `.github/workflows/lighthouse.yml`)
- Performance budgets enforced

## Release Process

This project uses Changesets for versioning:

```bash
# Create changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish (maintainers only)
pnpm changeset publish
```

**Branch Strategy:**
- `canary` - Main development branch (use for PRs)
- Release branches created from canary for stable releases

## Performance Considerations

- **Partial Pre-Rendering (PPR):** Enabled in Next.js config
- **Route Caching:** Middleware caches route lookups in KV
- **Fragment Composition:** Minimizes over-fetching from GraphQL
- **React cache():** Deduplicates fetches within request
- **Edge Runtime:** Middleware runs on edge for low latency

## Troubleshooting

**GraphQL Type Errors:**
- Run `cd core && pnpm run generate` to refresh schema

**Build Errors:**
- Ensure `.env.local` is properly configured
- Check that `BIGCOMMERCE_STORE_HASH` and `BIGCOMMERCE_ACCESS_TOKEN` are valid
- Verify Node.js version (20 or 22)

**Route Resolution Issues:**
- Check KV cache TTL if routes not updating
- Verify channel configuration in `channels.config.ts`
- Inspect middleware logs for route query failures

**Authentication Issues:**
- Ensure `AUTH_SECRET` is set and unique
- Verify `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN` has correct scopes
- Check session cookie settings if auth not persisting

## Vertex AI Retail Integration

Catalyst includes optional integration with Google Cloud Vertex AI Retail for enhanced search capabilities.

**Key Features:**
- Search-as-you-type with Vertex AI Search API
- Full search results page with faceted search
- Category/Brand browse pages using Browse API
- Event tracking for personalization

**Configuration:**
- Enable with `ENABLE_VERTEX_RETAIL_SEARCH=true`
- Requires GCP project with Vertex Retail API enabled
- See `VERTEX_RETAIL_SETUP.md` for setup instructions
- See `VERCEL_DEPLOYMENT.md` for production deployment

**Architecture:**
- Two-step process: Vertex AI returns product IDs → BigCommerce GraphQL hydrates full product details
- Feature-flagged for easy rollback to native BigCommerce search
- Supports both local development (keyfile) and production (JSON credentials)
