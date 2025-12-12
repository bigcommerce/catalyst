---
"@bigcommerce/catalyst-core": patch
---

Catalyst has been upgraded to Next.js 15.5.9. This is a patch version upgrade that requires migration steps for existing stores to fix a security vulnerability.

## 🔒 Security Update

**This upgrade addresses a security vulnerability ([CVE-2025-55184 + CVE-2025-55183](https://nextjs.org/blog/security-update-2025-12-11))** that affects React Server Components. These vulnerabilities allow a Denial of Service attack and Source Code Exposure attach. This upgrade includes:

- Next.js 15.5.9 with the security patch
- React 19.1.4 and React DOM 19.1.4 with the security patch

**All users are strongly encouraged to upgrade immediately.**

## Key Changes

- ⚡ **Next.js 15.5.9**: Upgraded from Next.js 15.5.7 to 15.5.9
- ⚛️ **React 19**: Upgraded to React 19.1.4 and React DOM 19.1.4

## Migration Guide

### Update Dependencies

If you're maintaining a custom Catalyst store, update your `package.json`:

```json
{
  "dependencies": {
    "next": "15.5.9",
    "react": "19.1.4",
    "react-dom": "19.1.4"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "15.5.9",
    "eslint-config-next": "15.5.9"
  }
}
```

Then run:

```bash
pnpm install
```
