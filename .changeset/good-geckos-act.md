---
"@bigcommerce/catalyst-core": minor
---

Add basic support for Google Analytics via Big Open Data Layer. BODL and GA4 integration is encapsulated in bodl library which hides current complexity and limitations that will be improved in future. It can be extended with more events and integrations with other analytics providers later. Data transformation from Catalyst data models to BODL and firing events is done in client components, as only frontend events are supported by BODL for now.

List of currently supported events:
View product category
View product page
Add product to cart
View cart
Remove product from cart

In order to configure you need to specify NEXT_PUBLIC_GOOGLE_ANALYTICS_ID environment variable which is essentially your GA4 ID.
