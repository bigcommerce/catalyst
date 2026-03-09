---
"@bigcommerce/catalyst-core": minor
---

Upgrade Next.js to v16 and align peer dependencies.

To migrate your Catalyst storefront to Next.js 16:

- Update `next` to `^16.0.0` in your `package.json` and install dependencies.
- Replace any usage of `unstable_expireTag` with `revalidateTag` and `unstable_expirePath` with `revalidatePath` from `next/cache`.
- Update `tsconfig.json` to use `"moduleResolution": "bundler"` and `"module": "nodenext"` as required by Next.js 16.
- Address Next.js 16 deprecation lint errors (e.g. legacy `<img>` elements, missing `rel="noopener noreferrer"` on external links).
- Rename `middleware.ts` to `proxy.ts` and change `export const middleware` to `export const proxy` (Next.js 16 proxy pattern).
- Ensure you are running Node.js 24+ (proxy runs on the Node.js runtime, not Edge).
