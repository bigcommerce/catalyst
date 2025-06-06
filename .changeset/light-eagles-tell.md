---
"@bigcommerce/catalyst-core": minor
---

Replaces the REST-powered `client.fetchShippingZones` method with a GraphQL-powered query containing the `site.settings.shipping.supportedShippingDestinations` field.

Migration:

1. The return type of `getShippingCountries` has the same shape as the `Country` BigCommerce GraphQL type, so you should be able to copy the graphql query from `core/app/[locale]/(default)/cart/page-data.ts` into your project and replace the existing `getShippingCountries` method in there.
2. Remove the argument `data.geography` from the `getShippingCountries` invocation in `core/app/[locale]/(default)/cart/page.tsx`
3. Finally, you should be able to delete the file `core/client/management/get-shipping-zones.ts` assuming it is no longer referenced anywhere in `core/`
