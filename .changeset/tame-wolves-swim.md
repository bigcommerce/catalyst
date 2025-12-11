---
"@bigcommerce/catalyst-core": patch
---

# Next.js 15.5.8 Upgrade

Catalyst has been upgraded to Next.js 15.5.8. This is a patch version upgrade that requires migration steps for existing stores to fix a security vulnerability.

## 🔒 Critical Security Update

**This upgrade addresses a critical security vulnerability ([CVE-2025-55184 + CVE-2025-55183](https://nextjs.org/blog/security-update-2025-12-11))** that affects React Server Components. These vulnerabilities allow a Denial of Service attack and Source Code Exposure attach. This upgrade includes:

- Next.js 15.5.8 with the security patch
- React 19.1.3 and React DOM 19.1.3 with the security patch

**All users are strongly encouraged to upgrade immediately.**

## Key Changes

- ⚡ **Next.js 15.5.8**: Upgraded from Next.js 15.5.7 to 15.5.8
- ⚛️ **React 19**: Upgraded to React 19.1.3 and React DOM 19.1.3

## Migration Guide

### Update Dependencies

If you're maintaining a custom Catalyst store, update your `package.json`:

```json
{
  "dependencies": {
    "next": "15.5.8",
    "react": "19.1.3",
    "react-dom": "19.1.3"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "15.5.8",
    "eslint-config-next": "15.5.8"
  }
}
```

Then run:
```bash
pnpm install
```
