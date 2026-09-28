---
'@bigcommerce/catalyst-core': patch
---

Always render the `hosting` meta tag: `native` on native hosting, `vercel` on Vercel, `other` everywhere else. Previously it was omitted off native hosting.
