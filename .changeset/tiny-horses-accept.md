---
"@bigcommerce/catalyst-core": patch
---

Replace `StreamableAnalyticsProvider`with simplified `AnalyticsProvider` component.

- Removed `StreamableAnalyticsProvider` that used `Streamable.from()` for async data loading.
- Added new `AnalyticsProvider` component that accepts `channelId` and `settings` as direct props.
- Simplifies analytics initialization by removing unnecessary streaming complexity.
- Maintains same functionality with cleaner, more straightforward implementation.
- Fixes issue of events not triggering by properly wrapping `children` inside the provider.

## Migration
- Use new `AnalyticsProvider` component in `core/app/[locale]/layout.tsx`, instead of `StreamableAnalyticsProvider`.