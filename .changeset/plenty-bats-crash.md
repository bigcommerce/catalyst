---
"@bigcommerce/catalyst-client": minor
---

Remove the `xAuthToken` config parameter from `@bigcommerce/catalyst-client`. The client no longer has any dependency on a BigCommerce access token, now that we have replaced the `/v2/shipping/zones` REST API call with an appropriate GraphQL field (`site.settings.shipping.supportedShippingDestinations`).

Migration:

1. If you are using the version of the client published to NPM, simply ensure you are using at least `@bigcommerce/catalyst-client@0.16.0` or higher.
2. If you are using the client in your pnpm workspace, simply remove the `xAuthToken` references in `packages/client/src/client.ts` as well as the `fetchShippingZones` method.
3. Remove the reference to `xAuthToken` in `core/client/index.ts`
