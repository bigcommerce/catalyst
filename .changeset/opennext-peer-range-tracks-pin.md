---
"@bigcommerce/catalyst": patch
---

Require `@opennextjs/cloudflare` 1.20.6 or newer. The CLI previously declared support back to 1.17.3, but only ever targeted and tested the version it pins new Commerce Hosting projects to.

If your project is on an older adapter you will now see an unmet peer dependency warning. Nothing breaks. To clear it, take the upgrade `catalyst deploy` offers, or update it yourself with `npm add @opennextjs/cloudflare@1.20.6`.
