---
"@bigcommerce/catalyst-core": patch
---

Pass search params to router.redirect when swapping locales.

## Migration

Modify `useSwitchLocale` hook to include `Object.fromEntries(searchParams.entries())`.
