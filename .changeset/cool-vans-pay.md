---
"@bigcommerce/catalyst-makeswift": patch
---

Enable Makeswift builder to work in different environments by adding `apiOrigin` and `appOrigin` props to `ReactRuntimeProvider`.

**Action required:** Add the following environment variables:

- `NEXT_PUBLIC_MAKESWIFT_API_ORIGIN`
- `NEXT_PUBLIC_MAKESWIFT_APP_ORIGIN`

**Deprecation notice:** `MAKESWIFT_API_ORIGIN` and `MAKESWIFT_APP_ORIGIN` are deprecated and will be removed in v1.4.0. Prefix `MAKESWIFT_API_ORIGIN` and `MAKESWIFT_APP_ORIGIN` with `NEXT_PUBLIC_` to migrate.
