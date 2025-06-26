# Changelog

## 1.0.0

### Major Changes

- [#2435](https://github.com/bigcommerce/catalyst/pull/2435) [`cd4bd60`](https://github.com/bigcommerce/catalyst/commit/cd4bd604739b0cea4b622b08ebbde4cea953fcae) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Release 1.0.0

### Minor Changes

- [#2370](https://github.com/bigcommerce/catalyst/pull/2370) [`20b8788`](https://github.com/bigcommerce/catalyst/commit/20b87882e089438c6183e83a506267e432a4f741) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Remove the `xAuthToken` config parameter from `@bigcommerce/catalyst-client`. The client no longer has any dependency on a BigCommerce access token, now that we have replaced the `/v2/shipping/zones` REST API call with an appropriate GraphQL field (`site.settings.shipping.supportedShippingDestinations`).

  Migration:

  1. If you are using the version of the client published to NPM, simply ensure you are using at least `@bigcommerce/catalyst-client@0.16.0` or higher.
  2. If you are using the client in your pnpm workspace, simply remove the `xAuthToken` references in `packages/client/src/client.ts` as well as the `fetchShippingZones` method.
  3. Remove the reference to `xAuthToken` in `core/client/index.ts`

## 0.15.0

### Minor Changes

- [#1914](https://github.com/bigcommerce/catalyst/pull/1914) [`f039b2c`](https://github.com/bigcommerce/catalyst/commit/f039b2c7235118626d7a727bff5271ac8982f910) Thanks [@jorgemoya](https://github.com/jorgemoya)! - GQL requests that respond as `200` but have an `errors` field will now be properly handled by the client and throw a proper `BigCommerceGQLError` response with the message reason from the API. This will provide a more detailed description of why the GQL request errored out.

  API errors will still be handled and attribute the errored status as the message with this change as `BigCommerceAPIError`.

- [`0aa23e2`](undefined) - Add an `onError` callback to in order to handle auth and invalid sessions.

- [#2124](https://github.com/bigcommerce/catalyst/pull/2124) [`4a00a27`](https://github.com/bigcommerce/catalyst/commit/4a00a27acea733b6f3fef221b3d1472b145d25f0) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add an `errorPolicy` option for GQL requests. Accepts `none`, `ignore`, `all`. Defaults to `none` which throws an error if there are GQL errors, `ignore` returns the data without error object, and `all` returns both data and errors.

### Patch Changes

- [`c830100`](undefined) - Manual changes on a dependency bumps.

- [#2226](https://github.com/bigcommerce/catalyst/pull/2226) [`3b14d66`](https://github.com/bigcommerce/catalyst/commit/3b14d668d32e7ebe37e31b1851b3db8f8be46bec) Thanks [@bookernath](https://github.com/bookernath)! - Add GraphQL operation name and type to GraphQL URL as query parameters to improve server logging of GraphQL operations

## 0.14.0

### Minor Changes

- [#1636](https://github.com/bigcommerce/catalyst/pull/1636) [`23abacf`](https://github.com/bigcommerce/catalyst/commit/23abacfb8ff4ff9d269e51821a6a992a9cb2d4f5) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add optional error to BigCommerceResponse type

## 0.13.0

### Minor Changes

- [#1623](https://github.com/bigcommerce/catalyst/pull/1623) [`16e3a76`](https://github.com/bigcommerce/catalyst/commit/16e3a763571324dccd9031a79e400409eff9ee0c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds async support to beforeRequest hook

## 0.12.0

### Minor Changes

- [#1262](https://github.com/bigcommerce/catalyst/pull/1262) [`0c2023b`](https://github.com/bigcommerce/catalyst/commit/0c2023bae650039cd79ba51b1161b5c8c16f0b8d) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Removes all usages of the customer impersonation token. Also updates the docs to correspond with the Storefront API Token.

- [#1262](https://github.com/bigcommerce/catalyst/pull/1262) [`0c2023b`](https://github.com/bigcommerce/catalyst/commit/0c2023bae650039cd79ba51b1161b5c8c16f0b8d) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Allows the ability to consume a [storefront token](https://developer.bigcommerce.com/docs/rest-authentication/tokens#storefront-tokens). This new token will allow Catalyst to create `customerAccessToken`'s whenever a user logs into their account. This change doesn't include consuming the either token, only adding the ability to pass it in.

## 0.11.0

### Minor Changes

- [#1483](https://github.com/bigcommerce/catalyst/pull/1483) [`d4120d3`](https://github.com/bigcommerce/catalyst/commit/d4120d39c10398e842a7ebe14ada685ec8aae3a8) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Start collecting telemetry.

## 0.10.0

### Minor Changes

- [#1449](https://github.com/bigcommerce/catalyst/pull/1449) [`2d1526a`](https://github.com/bigcommerce/catalyst/commit/2d1526a50402b2eb677abd55f19fb904234d1a84) Thanks [@bookernath](https://github.com/bookernath)! - Support Trusted Proxy in client to support higher-traffic stores

## 0.9.0

### Minor Changes

- [#1384](https://github.com/bigcommerce/catalyst/pull/1384) [`17692ca`](https://github.com/bigcommerce/catalyst/commit/17692caa3ff9b25180359d8a020470ece3e589f6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add the ability to hook into the fetchOptions before the request is sent.

## 0.8.0

### Minor Changes

- [#1350](https://github.com/bigcommerce/catalyst/pull/1350) [`88663d1`](https://github.com/bigcommerce/catalyst/commit/88663d165691380b35f83726f0589896bdc73bf2) Thanks [@deini](https://github.com/deini)! - remove graphql and use @0no-co/graphql.web for a smaller bundle size

## 0.7.0

### Minor Changes

- [#1261](https://github.com/bigcommerce/catalyst/pull/1261) [`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove the need of fetching shipping countries by using the GraphQL data.

## 0.6.0

### Minor Changes

- [#1200](https://github.com/bigcommerce/catalyst/pull/1200) [`51704d9`](https://github.com/bigcommerce/catalyst/commit/51704d9b9a7158c625c84f79e2ba95f98c6dc673) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove the `fetchAvailableCountries` query as it is no longer needed in Catalyst. This helps us remove queries that are dependent on the access token.

## 0.5.0

### Minor Changes

- [#1098](https://github.com/bigcommerce/catalyst/pull/1098) [`405e791`](https://github.com/bigcommerce/catalyst/commit/405e791af8e7ecc1422f2ce18cb216a8c04cc73b) Thanks [@bookernath](https://github.com/bookernath)! - Move Sitemap Index fetching into the client & normalize user agents

### Patch Changes

- [#994](https://github.com/bigcommerce/catalyst/pull/994) [`8766305`](https://github.com/bigcommerce/catalyst/commit/8766305b65ca10422e7921b2fd15796e0a09d27a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add channelId param to client to allow fetching from multiple channels with the same client.

- [#1055](https://github.com/bigcommerce/catalyst/pull/1055) [`52214a3`](https://github.com/bigcommerce/catalyst/commit/52214a376bba1fdaa584de31c36f7d6cdc078624) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add getChannelId param to dynamically fetch a channel on requests.

## 0.4.0

### Minor Changes

- [#910](https://github.com/bigcommerce/catalyst/pull/910) [`d0352c0`](https://github.com/bigcommerce/catalyst/commit/d0352c08b43e76b4cd838cb7916f9993228e3fa0) Thanks [@deini](https://github.com/deini)! - removes fetch cart redirect from client and fetch it with gql

## 0.3.0

### Minor Changes

- [#753](https://github.com/bigcommerce/catalyst/pull/753) [`48c040e`](https://github.com/bigcommerce/catalyst/commit/48c040e94745134f4c60b15cadcdb0a0bbcb2a36) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Deprecate `node@18` in favor of latest LTS version `node@20`.

## 0.2.2

### Patch Changes

- [#740](https://github.com/bigcommerce/catalyst/pull/740) [`d586c21`](https://github.com/bigcommerce/catalyst/commit/d586c2122bf6513b2f7d923957636c7ea8aaf2ce) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump next-auth and use string for user id

## 0.2.1

### Patch Changes

- [#735](https://github.com/bigcommerce/catalyst/pull/735) [`3db9c5f`](https://github.com/bigcommerce/catalyst/commit/3db9c5fa603299a5c5a9a12bd5408f9024677b20) Thanks [@deini](https://github.com/deini)! - Bump dependencies

## 0.2.0

### Minor Changes

- [#685](https://github.com/bigcommerce/catalyst/pull/685) [`ac733cc`](https://github.com/bigcommerce/catalyst/commit/ac733cc0308b3ebe1189fe6a7d20214dbc382b3f) Thanks [@deini](https://github.com/deini)! - adds support for DocumentNode
  All notable changes to this project will be documented in this file.
