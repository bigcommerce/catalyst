# AGENTS.md

## BigCommerce Catalyst Codebase Overview

This document provides guidance for Large Language Models (LLMs) working with the BigCommerce Catalyst codebase, focusing on the Next.js application architecture, data fetching patterns, and key design principles.

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

A custom `Streamable` utility provides suspense-friendly data fetching that works seamlessly with PPR. This pattern:

- Wraps promises in a lazy-loading container
- Provides stable promise instances for identical inputs
- Integrates with React's `use()` hook and Suspense boundaries

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

The UI design system is completely separated into the `vibes/soul` directory structure, providing clean separation between business logic and presentation.

### Component Hierarchy

1. **Primitives** (`vibes/soul/primitives/`) - Basic reusable UI components like buttons, cards, forms.

2. **Sections** (`vibes/soul/sections/`) - Page-level components that compose primitives into complete page sections.

3. **Library** (`vibes/soul/lib/`) - Utility functions and patterns like the Streamable implementation.

### Import Patterns

Components should be imported from the vibes design system using the `@/vibes/soul/` alias, maintaining clear separation between business logic in `/components` and design system components in `/vibes`.

## Key Architectural Principles

1. **Routing Flexibility**: Unlike typical Next.js applications, URLs are resolved dynamically via GraphQL rather than file structure
2. **Progressive Enhancement**: Static content loads immediately with dynamic content streaming via PPR and Streamable
3. **Design System Separation**: Complete separation between business components and design system components
4. **Centralized API Access**: All BigCommerce API interactions go through the configured GraphQL client
5. **Middleware-First**: Critical functionality like routing, auth, and internationalization handled at the middleware layer

## Notes

This codebase differs significantly from typical Next.js applications due to the custom routing middleware and e-commerce-specific patterns. The `with-routes` middleware essentially turns Next.js into a headless CMS router, where content structure is determined by the BigCommerce backend rather than the filesystem. Understanding this fundamental difference is crucial for working effectively with the codebase.

The Streamable pattern and PPR integration provide excellent user experience through progressive loading, but require understanding of React's newer concurrent features like the `use()` hook and Suspense boundaries.
