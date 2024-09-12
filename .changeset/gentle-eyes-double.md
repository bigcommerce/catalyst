---
"@bigcommerce/catalyst-core": patch
---

Change LocalePrefix mode to `as-needed`, since there's an issue that is causing caching problems when using `never`.

More info about LocalePrefixes: https://next-intl-docs.vercel.app/docs/routing#shared-configuration
Open issue: https://github.com/amannn/next-intl/issues/786
