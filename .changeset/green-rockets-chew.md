---
"@bigcommerce/catalyst-core": patch
---

# Next.js 15.5.7 Upgrade

Catalyst has been upgraded to Next.js 15.5.7. This is a patch version upgrade that requires migration steps for existing stores to fix a security vulnerability.

## 🔒 Critical Security Update

**This upgrade addresses a critical security vulnerability ([CVE-2025-55182](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components))** that affects React Server Components. The vulnerability allowed unauthenticated remote code execution on servers running React Server Components. This upgrade includes:

- Next.js 15.5.7 with the security patch
- React 19.1.2 and React DOM 19.1.2 with the security patch

**All users are strongly encouraged to upgrade immediately.**

## Key Changes

- ⚡ **Next.js 15.5.7**: Upgraded from Next.js 15.5.1-canary.4 to 15.5.7 (no more canary)
- ⚛️ **React 19**: Upgraded to React 19.1.2 and React DOM 19.1.2
- 🔄 **Partial Prerendering (PPR) Removed**: Removed partial prerendering as it's unsupported in non-canary versions of Next.js 15.

### ⚠️ Partial Prerendering (PPR) Removed 

**Important**: PPR (Partial Prerendering) has been **removed** in this release as it's unsupported in non-canary versions of Next.js 15. 

- The `ppr` experimental flag has been removed from `next.config.ts`
- Full support for Next.js 16's and it's new cache component patterns will be added in a future release
- This may result in different performance characteristics compared to the Next.js 15 + PPR setup

## Migration Guide

### Step 1: Update Dependencies

If you're maintaining a custom Catalyst store, update your `package.json`:

```json
{
  "dependencies": {
    "next": "15.5.7",
    "react": "^19.1.2",
    "react-dom": "^19.1.2"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "15.5.7",
    "eslint-config-next": "15.5.7"
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

Remove or comment out eslint config
```typescript
// eslint: {
//     ignoreDuringBuilds: !!process.env.CI,
//     dirs: [
//     'app',
//     'auth',
//     'build-config',
//     'client',
//     'components',
//     'data-transformers',
//     'i18n',
//     'lib',
//     'middlewares',
//     'scripts',
//     'tests',
//     'vibes',
//     ],
// },
```

### Step 3: Remove `export const experimental_ppr`

Remove any references to `export const experimental_ppr` in your codebase as it is not being used anymore.
