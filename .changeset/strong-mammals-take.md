---
"@bigcommerce/catalyst-core": minor 
---

# Next.js 16 Upgrade

Catalyst has been upgraded to Next.js 16, bringing improved performance, new features, and better developer experience. This is a **minor version upgrade** that requires migration steps for existing stores.

## 🔒 Critical Security Update

**This upgrade addresses a critical security vulnerability ([CVE-2025-55182](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components))** that affects React Server Components. The vulnerability allowed unauthenticated remote code execution on servers running React Server Components. This upgrade includes:

- Next.js 16.0.7 with the security patch
- React 19.2.1 and React DOM 19.2.1 with the security patch

**All users are strongly encouraged to upgrade immediately.**

## Key Changes

- ⚡ **Next.js 16.0.7**: Upgraded from Next.js 15.x to 16.0.7 (no more canary)
- ⚛️ **React 19**: Upgraded to React 19.2.1 and React DOM 19.2.1
- 🔄 **Cache Revalidation**: Removed `unstable_expireTag` and `unstable_expirePath` in favor of stable `revalidateTag` and `revalidatePath` API

## Breaking Changes

### ⚠️ Partial Prerendering (PPR) Removed 

**Important**: PPR (Partial Prerendering) has been **removed** in this release due to compatibility issues with Next.js 16's new caching behavior. 

- The `ppr` experimental flag has been removed from `next.config.ts`
- Full support for Next.js 16's new cache component patterns will be added in a future release
- This may result in different performance characteristics compared to the Next.js 15 + PPR setup

## Migration Guide

### Step 1: Update Dependencies

If you're maintaining a custom Catalyst store, update your `package.json`:

```json
{
  "dependencies": {
    "next": "16.0.7",
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  }
}
```

Then run:
```bash
pnpm install
```

### Step 2: Update next.config.ts

Remove or comment out PPR configuration:

```typescript
// Remove or disable:
// experimental: {
//   ppr: 'incremental',
// }
```

### Step 3: Replace instances of `unstable_expireTag` and `unstable_expirePath` 

Use `revalidatePath` and `revalidateTag` instead.

## What's Coming Next

🚧 **Future Enhancements** (planned for upcoming releases):

- Full support for Next.js 16's new cache component patterns
- Re-evaluation of PPR with Next.js 16's improved caching mechanisms
- Performance optimizations leveraging Next.js 16's new features
- Migration from middleware to proxy-based routing for improved performance
- Migration guide for adopting cache components when support is added
