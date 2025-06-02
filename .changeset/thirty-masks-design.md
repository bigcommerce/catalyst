---
"@bigcommerce/catalyst-core": patch
---

Add locale prefix to auth middleware protected route URLPattern

## Migration

In `core/middlewares/with-auth.ts`, update the `protectedPathPattern` variable to include an optional path segment for the locale:
```tsx
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });
```
