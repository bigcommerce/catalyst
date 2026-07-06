---
"@bigcommerce/catalyst-core": patch
---

Fix Account Settings failing to save for customers when a merchant-defined required custom customer field exists. BigCommerce revalidates required custom fields on every `updateCustomer` call, so Account Settings now renders and resubmits those fields (mirroring the existing Register/Address form-field support) instead of only supporting first name, last name, email, and company.
