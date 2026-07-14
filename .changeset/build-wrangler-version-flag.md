---
"@bigcommerce/catalyst": patch
---

Add a `--wrangler-version <version>` flag to `catalyst build` and `catalyst deploy` so developers can build against a Wrangler version or dist-tag other than the pinned default. When omitted, the build uses the pinned default as before (and the flag is ignored by `deploy --prebuilt`, which skips the build). The value is validated to look like a version or dist-tag before it's interpolated into the `wrangler@<version>` spec.
