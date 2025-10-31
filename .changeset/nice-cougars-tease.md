---
"@bigcommerce/catalyst-core": patch
---

Load GA4 (gtag) using C15T's prebuilt script. Consent will be shared by Consent Manager. Configuration available via `GtagConfig` prop in `ConsentManager` component.

## Migration
- Install `@c15t/scripts` library
- Update `ConsentManager` component to include `GtagConfig` and pass `gtag` script to `ConsentManagerProvider`.
- Update `core/lib/analytics/providers/google-analytics/index.ts` to use `gtag` loaded from C15T instead of initializing directly.


