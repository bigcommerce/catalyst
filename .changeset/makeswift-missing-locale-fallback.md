---
"@bigcommerce/catalyst-makeswift": patch
---

Fall back to the default locale's Makeswift components (such as the site header, footer and theme) when the Makeswift site hasn't added the storefront's locale. Since `@makeswift/runtime` 0.29, these requests fail for such locales, which broke every page in them.
