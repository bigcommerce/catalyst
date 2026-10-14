---
'@bigcommerce/catalyst': patch
---

The CLI now refers to BigCommerce Storefront Hosting instead of Native Hosting and Commerce Hosting in help text, prompts and messages. `catalyst create --hosting bigcommerce` replaces `--hosting commerce`, which still works but prints a deprecation warning.
