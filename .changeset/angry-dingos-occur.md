---
"@bigcommerce/catalyst-core": minor
---

Adds consent-aware script loading to Catalyst's consent manager, achieving parity with Stencil's behavior where scripts are conditionally rendered based on user consent preferences. BigCommerce scripts from the Store Scripts API are now transformed and loaded via C15T's ClientSideOptionsProvider, with ESSENTIAL/UNKNOWN scripts rendering by default, all scripts rendering when consent is fully granted, and specific scripts loading based on granular consent selections.
