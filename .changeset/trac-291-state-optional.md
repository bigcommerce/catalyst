---
"@bigcommerce/catalyst-core": patch
---

Fix Account Registration validating State/Province as required for countries without any states (e.g., Algeria). The register page now queries per-country state data from BigCommerce and hides the State/Province field entirely when the selected country has no states.
