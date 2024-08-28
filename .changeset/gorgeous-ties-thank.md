---
"@bigcommerce/catalyst-core": patch
---

Refactors tabs in `/account` to each be their own page. This also removes unused links in account home page (and tests) until we have that functionality available.

Previous structure:
```
/account
  [tab]
    page.tsx
```

New structure:
```
/account
  (tabs)
    addresses
      page.tsx
    settings
      page.tsx
    ...etc
```
