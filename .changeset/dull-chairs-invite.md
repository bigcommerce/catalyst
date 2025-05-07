---
"@bigcommerce/catalyst-core": patch
---

Allow a list of CDN hostnames for cases when there can be more than one CDN available for image loader.

Migration:

- Update `build-config` schema to make `cndUrls` an array of strings.
- Update `next.config.ts` to set `cdnUrls` as an array, and set multiple preconnected Link headers (one per CDN).
- `shouldUseLoaderProp` function now reads from array.
