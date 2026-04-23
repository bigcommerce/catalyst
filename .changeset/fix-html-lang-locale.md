---
"@bigcommerce/catalyst-core": minor
---

Restore locale-aware `lang` attribute on the root `<html>` tag. The previous root layout hardcoded `lang="en"` for all locales; ownership of `<html>`/`<body>` now lives in `app/[locale]/layout.tsx` so `lang={locale}` reflects the active locale. The root `app/layout.tsx` is now a passthrough, and `app/not-found.tsx` is self-sufficient (renders its own `<html>`/`<body>`) to preserve the branded 404 for non-localized requests.
