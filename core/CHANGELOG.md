# Changelog

## 0.17.1

### Patch Changes

- Updated dependencies [[`d4120d3`](https://github.com/bigcommerce/catalyst/commit/d4120d39c10398e842a7ebe14ada685ec8aae3a8)]:
  - @bigcommerce/catalyst-client@0.11.0

## 0.17.0

### Minor Changes

- [#1401](https://github.com/bigcommerce/catalyst/pull/1401) [`3095002`](https://github.com/bigcommerce/catalyst/commit/3095002d7a10b9c4058016076deb7a45fc8ae7bb) Thanks [@bookernath](https://github.com/bookernath)! - Add dynamic robots.txt from control panel settings

### Patch Changes

- [#1477](https://github.com/bigcommerce/catalyst/pull/1477) [`79e705f`](https://github.com/bigcommerce/catalyst/commit/79e705f151a733a811effed40757030aba6b6300) Thanks [@deini](https://github.com/deini)! - Breadcrumbs for top level category pages are no longer rendered

- [#1467](https://github.com/bigcommerce/catalyst/pull/1467) [`e763a83`](https://github.com/bigcommerce/catalyst/commit/e763a83bcd4b8b5311586247291338eb65fbc476) Thanks [@deini](https://github.com/deini)! - Fixes an issue when a numeric product option set to a minimum <= 0 breaks the counter component.

- [#1459](https://github.com/bigcommerce/catalyst/pull/1459) [`b4485c7`](https://github.com/bigcommerce/catalyst/commit/b4485c76de8c83546c68a7b50fcb7991603dbf6e) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Updates the with-routes middleware to fallback on locale based rewrite logic if the redirect is a dynamic entity redirect.

- [#1469](https://github.com/bigcommerce/catalyst/pull/1469) [`8e9e7f3`](https://github.com/bigcommerce/catalyst/commit/8e9e7f3d40545004b080146b4dbb42f4ac7cf17c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fixes the product quantity reseting back to the previous value when adjusting the quantity fails.

- [#1476](https://github.com/bigcommerce/catalyst/pull/1476) [`d47e3ac`](https://github.com/bigcommerce/catalyst/commit/d47e3aceb244713bc996287319357e6af3d865ed) Thanks [@deini](https://github.com/deini)! - adds an empty state to category pages

- [#1458](https://github.com/bigcommerce/catalyst/pull/1458) [`3d67f8d`](https://github.com/bigcommerce/catalyst/commit/3d67f8d0d1776d747e9aa485b0b29a738eeacf3c) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add no-store to mutations that are rate limited.

- [#1453](https://github.com/bigcommerce/catalyst/pull/1453) [`1c8b042`](https://github.com/bigcommerce/catalyst/commit/1c8b04278074eb55358a5515f330a011de9561b5) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- Updated dependencies [[`2d1526a`](https://github.com/bigcommerce/catalyst/commit/2d1526a50402b2eb677abd55f19fb904234d1a84)]:
  - @bigcommerce/catalyst-client@0.10.0

## 0.16.0

### Minor Changes

- [#1410](https://github.com/bigcommerce/catalyst/pull/1410) [`53cca82`](https://github.com/bigcommerce/catalyst/commit/53cca82611272fc3be24505b7c6d5866f10c87fd) Thanks [@bookernath](https://github.com/bookernath)! - Move /reset page to /login/forgot-password in order to reduce top-level routes.

- [#1384](https://github.com/bigcommerce/catalyst/pull/1384) [`17692ca`](https://github.com/bigcommerce/catalyst/commit/17692caa3ff9b25180359d8a020470ece3e589f6) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Pass customer ip address into requests that don't rely on cached values.

- [#1388](https://github.com/bigcommerce/catalyst/pull/1388) [`a309a4d`](https://github.com/bigcommerce/catalyst/commit/a309a4dd47083a58c998a4f6d169185177cca571) Thanks [@deini](https://github.com/deini)! - wraps header and footer in suspense boundaries

### Patch Changes

- [#1374](https://github.com/bigcommerce/catalyst/pull/1374) [`1f76f61`](https://github.com/bigcommerce/catalyst/commit/1f76f615b38bb41db770653bd8e7947cd6361b18) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Prepend locale for redirected urls in tests.
  More info: https://github.com/amannn/next-intl/issues/1335

- [#1373](https://github.com/bigcommerce/catalyst/pull/1373) [`971033f`](https://github.com/bigcommerce/catalyst/commit/971033fc63181bad15aa46abb65b0d44501922c9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing metadata in account settings page.

- [#1370](https://github.com/bigcommerce/catalyst/pull/1370) [`655d518`](https://github.com/bigcommerce/catalyst/commit/655d518b2fd662614539467fff940b2b5ff78567) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1446](https://github.com/bigcommerce/catalyst/pull/1446) [`ba4820b`](https://github.com/bigcommerce/catalyst/commit/ba4820bf6dd36d0155028ad3db094bd9745d5d94) Thanks [@deini](https://github.com/deini)! - Fixes a bug where product variant was not reliably being selected on PDP when using pre-selected options.

- [#1391](https://github.com/bigcommerce/catalyst/pull/1391) [`4d64c31`](https://github.com/bigcommerce/catalyst/commit/4d64c31d4765dd72c81c1836b66aa1d7cb34b5f5) Thanks [@bookernath](https://github.com/bookernath)! - Get lossy image from API instead of setting param in code

- [#1389](https://github.com/bigcommerce/catalyst/pull/1389) [`a4eaff6`](https://github.com/bigcommerce/catalyst/commit/a4eaff6bb2520f748630e24a6a28ca31cd2eb2c3) Thanks [@bookernath](https://github.com/bookernath)! - Add additional IP address header

- [#1402](https://github.com/bigcommerce/catalyst/pull/1402) [`6e75ef5`](https://github.com/bigcommerce/catalyst/commit/6e75ef5097e0f3227c04ac0d9d7bbc484513bcce) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - fixing the problem with submitting the password change form

- [#1407](https://github.com/bigcommerce/catalyst/pull/1407) [`ac9832f`](https://github.com/bigcommerce/catalyst/commit/ac9832fcc61f01413a5b8f101f5f27c53ca1fce5) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1392](https://github.com/bigcommerce/catalyst/pull/1392) [`76227ac`](https://github.com/bigcommerce/catalyst/commit/76227ac06bb349f604f1d2d4a9b68e7d0869eba4) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1424](https://github.com/bigcommerce/catalyst/pull/1424) [`4874add`](https://github.com/bigcommerce/catalyst/commit/4874addfbdde90ac45aa57c10767587ba4c50735) Thanks [@bc-svc-local](https://github.com/bc-svc-local)! - Update translations.

- [#1445](https://github.com/bigcommerce/catalyst/pull/1445) [`ba3f513`](https://github.com/bigcommerce/catalyst/commit/ba3f513ac4242ce6883ad6ab635d38156a271ca9) Thanks [@deini](https://github.com/deini)! - Adds optimistic updates to all "Add to cart" buttons. This change makes the UI feel snappier and give quick feedback on user interaction.

- Updated dependencies [[`17692ca`](https://github.com/bigcommerce/catalyst/commit/17692caa3ff9b25180359d8a020470ece3e589f6)]:
  - @bigcommerce/catalyst-client@0.9.0

## 0.15.0

### Minor Changes

- [#1362](https://github.com/bigcommerce/catalyst/pull/1362) [`0814afe`](https://github.com/bigcommerce/catalyst/commit/0814afefca00b2497dddb0622df45f4d50865882) Thanks [@deini](https://github.com/deini)! - If app is not running on Vercel's infra, `<Analytics />` and `<SpeedInsights />` are not rendered.

  Opt-out of vercel analytics and speed insights by setting the following env vars to `true`

  - `DISABLE_VERCEL_ANALYTICS`
  - `DISABLE_VERCEL_SPEED_INSIGHTS`

- [#1354](https://github.com/bigcommerce/catalyst/pull/1354) [`3d298c7`](https://github.com/bigcommerce/catalyst/commit/3d298c7190e01309ee706c0b9696f8851071e73c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Move address forms in account to their own /add and /edit pages.

- [#1280](https://github.com/bigcommerce/catalyst/pull/1280) [`27cbfd2`](https://github.com/bigcommerce/catalyst/commit/27cbfd20307d630f44c2c236e2e0c61a9e57be33) Thanks [@bookernath](https://github.com/bookernath)! - Add dynamic favicon from API on a static route

- [#1357](https://github.com/bigcommerce/catalyst/pull/1357) [`3176491`](https://github.com/bigcommerce/catalyst/commit/317649109861e75fa46794e0cbf67dca500947a6) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add /account/settings/change-password route for change password form.

### Patch Changes

- [#1361](https://github.com/bigcommerce/catalyst/pull/1361) [`dd10d06`](https://github.com/bigcommerce/catalyst/commit/dd10d064156e8fc0376f0cce6f698dc8b834f95e) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Enforce use of next-intl's wrapper navigation APIs.

- [#1360](https://github.com/bigcommerce/catalyst/pull/1360) [`00f72dd`](https://github.com/bigcommerce/catalyst/commit/00f72ddc7e3c2cff780430e074341ee72bc0c893) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change LocalePrefix mode to `as-needed`, since there's an issue that is causing caching problems when using `never`.

  More info about LocalePrefixes: https://next-intl-docs.vercel.app/docs/routing#shared-configuration
  Open issue: https://github.com/amannn/next-intl/issues/786

- [#1338](https://github.com/bigcommerce/catalyst/pull/1338) [`d50613a`](https://github.com/bigcommerce/catalyst/commit/d50613a669696f34a695bc35b9d40099eeea0660) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - improve redirect behavior after change password on account page

- [#1358](https://github.com/bigcommerce/catalyst/pull/1358) [`48db1b8`](https://github.com/bigcommerce/catalyst/commit/48db1b80a8aeb8e63fb920bf4374413c0d6c67c5) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update da and fr translations to use correct string templates.

- [#1368](https://github.com/bigcommerce/catalyst/pull/1368) [`d032e65`](https://github.com/bigcommerce/catalyst/commit/d032e659ba0ea1b45dc47e3afcb9094ca4f38afc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Localize metadata titles.

- [#1369](https://github.com/bigcommerce/catalyst/pull/1369) [`c9a5ab5`](https://github.com/bigcommerce/catalyst/commit/c9a5ab58be4dad966dc8d406ade8433f0f2b5d25) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Pass in default channel to favicon query, since `getLocale` can't be used in routes.

## 0.14.2

### Patch Changes

- Updated dependencies [[`88663d1`](https://github.com/bigcommerce/catalyst/commit/88663d165691380b35f83726f0589896bdc73bf2)]:
  - @bigcommerce/catalyst-client@0.8.0

## 0.14.1

### Patch Changes

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add numbers-only field & utils for account form fields

- [#1277](https://github.com/bigcommerce/catalyst/pull/1277) [`8e6253d`](https://github.com/bigcommerce/catalyst/commit/8e6253dbd3048b8318ce502192bc9f07314b3641) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update Slideshow prop to use altText for image. Rename Hero wrapper component to Slideshow.

- [#1302](https://github.com/bigcommerce/catalyst/pull/1302) [`a620a19`](https://github.com/bigcommerce/catalyst/commit/a620a191d3d30d50d0fa79fc36ad32ee28db8728) Thanks [@deini](https://github.com/deini)! - fix: decode webpage id to fix 404 on some Webpages

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add checkboxes field for account & addresses forms

- [#1346](https://github.com/bigcommerce/catalyst/pull/1346) [`33e133d`](https://github.com/bigcommerce/catalyst/commit/33e133df74b263aeabd23f72f6b8ccfdc22c1a36) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - fix placeholder positioning for picklist custom form field

- [#1316](https://github.com/bigcommerce/catalyst/pull/1316) [`4aea109`](https://github.com/bigcommerce/catalyst/commit/4aea109593e7ac060552dca18198e39c0b070e55) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Normalizes translations across all pages, updates the next-intl configuration, and simplifies translation handling in the project.

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add dates field for account & address forms

- [#1141](https://github.com/bigcommerce/catalyst/pull/1141) [`9f3c949`](https://github.com/bigcommerce/catalyst/commit/9f3c9492b2d4edcd404cffc92dfcfec6a0afc395) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - improve redirect behavior after creating new address

- [#1305](https://github.com/bigcommerce/catalyst/pull/1305) [`b11ba3d`](https://github.com/bigcommerce/catalyst/commit/b11ba3d63547d2772a649078274b5b71702c402a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Refactors tabs in `/account` to each be their own page. This also removes unused links in account home page (and tests) until we have that functionality available.

  Previous structure:

  ```
  /account
    [tab]
      page.tsx
  ```

  New structure:

  ```
  /account
    (tabs)
      addresses
        page.tsx
      settings
        page.tsx
      ...etc
  ```

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add multipleChoices field(radio-buttons, picklist) for account & address forms

- [#1334](https://github.com/bigcommerce/catalyst/pull/1334) [`00f43f0`](https://github.com/bigcommerce/catalyst/commit/00f43f045b4ac2f71aef36a41a1ef643bfc66247) Thanks [@deini](https://github.com/deini)! - Fixes a server crash when user switches language settings

- [#1333](https://github.com/bigcommerce/catalyst/pull/1333) [`e2c0153`](https://github.com/bigcommerce/catalyst/commit/e2c01535e0efbd474b1236d0a7e63ad2263475db) Thanks [@deini](https://github.com/deini)! - Splits i18n into request.ts and routing.ts This helps reduce our middleware bundle as we no longer do a dynamic import on our middleware entrypoint.

- [#1342](https://github.com/bigcommerce/catalyst/pull/1342) [`f7bb1e2`](https://github.com/bigcommerce/catalyst/commit/f7bb1e2654912c2b25851f3a86f77fa6f1014817) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update localeSwitcher to use a link instead of a form.

- [#1326](https://github.com/bigcommerce/catalyst/pull/1326) [`255c648`](https://github.com/bigcommerce/catalyst/commit/255c6482a48d735a28c632746b4a652d8ba1dfed) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Ensure recaptcha is bypassed for functional tests.

- [#1278](https://github.com/bigcommerce/catalyst/pull/1278) [`f8553c6`](https://github.com/bigcommerce/catalyst/commit/f8553c6c9fb35ab7a143fabd60719c8156269448) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix wrapping author text in BlogPostCard.

- [#1322](https://github.com/bigcommerce/catalyst/pull/1322) [`77ecb4b`](https://github.com/bigcommerce/catalyst/commit/77ecb4bb4f527e079788b0f9dff2468e92d0bc1a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Split auth forms to four different pages:

  - /login
  - /register
  - /reset
  - /change-password

  Additionally, moved shared form field components to `/components/form-fields/` and updated translations.

- [#1317](https://github.com/bigcommerce/catalyst/pull/1317) [`7802361`](https://github.com/bigcommerce/catalyst/commit/780236150bab6e2c43e73a230ed69113e3e1bae3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET to DEFAULT_REVALIDATE_TARGET since we don't need this exposed to the client.

- [#1296](https://github.com/bigcommerce/catalyst/pull/1296) [`fcd44bb`](https://github.com/bigcommerce/catalyst/commit/fcd44bb90bf2d82b098600f4809ae3f37d5c01dc) Thanks [@bookernath](https://github.com/bookernath)! - Add link header to preconnect to CDN

- [#1088](https://github.com/bigcommerce/catalyst/pull/1088) [`644361e`](https://github.com/bigcommerce/catalyst/commit/644361e8a75185e05964a782569c4b17dc5a9f98) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - improve redirect behavior after creating account

- [#1329](https://github.com/bigcommerce/catalyst/pull/1329) [`ad601e1`](https://github.com/bigcommerce/catalyst/commit/ad601e1be0f2e2b0e458363af13d3b7881f8cf24) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - update multiline form-field to respect required settings

- [#1257](https://github.com/bigcommerce/catalyst/pull/1257) [`d656e79`](https://github.com/bigcommerce/catalyst/commit/d656e7981c7516be560b1944e4351916572b7a05) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add multilinetext field for account & address forms

- [#1300](https://github.com/bigcommerce/catalyst/pull/1300) [`b32198b`](https://github.com/bigcommerce/catalyst/commit/b32198b78dcd18b05ba0c0f57269cbd62023a654) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Refactor queries, fragments, and mutations in an effort to set a pattern on where these functions need to be defined.

  Shared queries and mutations will remain in /client for now.

- [#1349](https://github.com/bigcommerce/catalyst/pull/1349) [`dd9cf6f`](https://github.com/bigcommerce/catalyst/commit/dd9cf6f61efb6b17322e1485225003d9799cbf9a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove updateCustomer and getCustomerAddresses queries since they are defined now where they are used.

- [#1313](https://github.com/bigcommerce/catalyst/pull/1313) [`6531bb2`](https://github.com/bigcommerce/catalyst/commit/6531bb2ee9b6a6125cd4f9f0e624e023897387be) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove "Quick add" button in PLP for products that have options. Will now just show a button that links to the product.

## 0.14.0

### Minor Changes

- [#1261](https://github.com/bigcommerce/catalyst/pull/1261) [`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Remove the need of fetching shipping countries by using the GraphQL data.

- [#1261](https://github.com/bigcommerce/catalyst/pull/1261) [`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fetch shipping zones if access token exists, otherwise regress back to using the geography node on graphql for shipping information. This is part of an effort to remove the need of the `BIGCOMMERCE_ACCESS_TOKEN`.

### Patch Changes

- [#1256](https://github.com/bigcommerce/catalyst/pull/1256) [`686abe9`](https://github.com/bigcommerce/catalyst/commit/686abe9eae18cd2241e7ac17e17f7139d6b87bd6) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Consistency improvements to prop APIs for UI components.

- Updated dependencies [[`f715067`](https://github.com/bigcommerce/catalyst/commit/f715067aa36616b3818c9424c57fa08e28936cde)]:
  - @bigcommerce/catalyst-client@0.7.0

## 0.13.0

### Minor Changes

- [#1166](https://github.com/bigcommerce/catalyst/pull/1166) [`0661e53`](https://github.com/bigcommerce/catalyst/commit/0661e53e66a12713a5ad23292a0a0eb25cddd9dc) Thanks [@bookernath](https://github.com/bookernath)! - Use default SEO settings from store for pages without SEO information specified, normalize SEO implementation across pages

- [#1194](https://github.com/bigcommerce/catalyst/pull/1194) [`b455b05`](https://github.com/bigcommerce/catalyst/commit/b455b05a6121b005bd5147a25c964b9554b1b350) Thanks [@BC-krasnoshapka](https://github.com/BC-krasnoshapka)! - Add basic support for Google Analytics via [Big Open Data Layer](https://developer.bigcommerce.com/docs/integrations/hosted-analytics). BODL and GA4 integration is encapsulated in `bodl` library which hides current complexity and limitations that will be improved in future. It can be extended with more events and integrations with other analytics providers later. Data transformation from Catalyst data models to BODL and firing events is done in client components, as only frontend events are supported by BODL for now.

  List of currently supported events:

  - View product category
  - View product page
  - Add product to cart
  - View cart
  - Remove product from cart

  In order to configure you need to specify `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` environment variable which is essentially your GA4 ID.

### Patch Changes

- [#1225](https://github.com/bigcommerce/catalyst/pull/1225) [`127f3b6`](https://github.com/bigcommerce/catalyst/commit/127f3b6000f0345a1e277d038025edadeaa09d71) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change prop `items` to `links` in Header.

- [#1232](https://github.com/bigcommerce/catalyst/pull/1232) [`b7d4986`](https://github.com/bigcommerce/catalyst/commit/b7d4986b390932be770de9adcf12112df4bb58e1) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove `Popover` component, utilize radix primitives instead.

- [#1196](https://github.com/bigcommerce/catalyst/pull/1196) [`b793661`](https://github.com/bigcommerce/catalyst/commit/b793661ab145a2acec5b2fa5aa0c5f1d6865cad9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add locale picker in header.

- [#1231](https://github.com/bigcommerce/catalyst/pull/1231) [`befb122`](https://github.com/bigcommerce/catalyst/commit/befb122d033ba56b87cb04f31e0f34fe4386d285) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Dropdown` component.

- [#1209](https://github.com/bigcommerce/catalyst/pull/1209) [`ef2f3cb`](https://github.com/bigcommerce/catalyst/commit/ef2f3cbddb872a5a2ad1c188f40cd5671eaf77b7) Thanks [@bookernath](https://github.com/bookernath)! - Limit number of chunks in webpack, customizable via env

- [#1239](https://github.com/bigcommerce/catalyst/pull/1239) [`9a37c6a`](https://github.com/bigcommerce/catalyst/commit/9a37c6a25ccaed7b7373cdb3637706c6826a380a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Search` component.

- [#1199](https://github.com/bigcommerce/catalyst/pull/1199) [`e8bf185`](https://github.com/bigcommerce/catalyst/commit/e8bf185f34061be96cfe6a118431c3a4c62df7a2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add more context when no result is found in search page.

- [#1236](https://github.com/bigcommerce/catalyst/pull/1236) [`7d9e865`](https://github.com/bigcommerce/catalyst/commit/7d9e86568c5422cb74ef512ba851ee709e9d59f0) Thanks [@bookernath](https://github.com/bookernath)! - Exclude node_modules from tailwind config to improve build time

- [#1214](https://github.com/bigcommerce/catalyst/pull/1214) [`4e890ff`](https://github.com/bigcommerce/catalyst/commit/4e890ffe203605c4a77be1acdf33622ff871405d) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change prop `value` to `title` in Accordions.

- [#1197](https://github.com/bigcommerce/catalyst/pull/1197) [`c831677`](https://github.com/bigcommerce/catalyst/commit/c831677cb873e67a898ffd1efeda0c518c6ab97d) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set key before spreading prop in some form components.

- [#1188](https://github.com/bigcommerce/catalyst/pull/1188) [`5c77f41`](https://github.com/bigcommerce/catalyst/commit/5c77f41eb6ced4677d85fef1adf898fe697a0452) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename brand prop to subtitle in Product Card.

- [#1234](https://github.com/bigcommerce/catalyst/pull/1234) [`052e94a`](https://github.com/bigcommerce/catalyst/commit/052e94abd76b52700badde189ec36aee6cc383b1) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Breadcrumbs` component.

- [#1224](https://github.com/bigcommerce/catalyst/pull/1224) [`5f934f9`](https://github.com/bigcommerce/catalyst/commit/5f934f91b790b9dd9001f133bdd75ce06951465c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Change prop `thumbnail` to `image` in BlogPostCard.

- [#1206](https://github.com/bigcommerce/catalyst/pull/1206) [`d1cf327`](https://github.com/bigcommerce/catalyst/commit/d1cf327d4c2c28f01940391a74cc4750d79b03b7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Slide` component to be used in `Slideshow`.

- [#1198](https://github.com/bigcommerce/catalyst/pull/1198) [`22dc862`](https://github.com/bigcommerce/catalyst/commit/22dc86260daaaeec20276a84b89c152a3ae246a3) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing accessibility components to Sheet/Mobile Nav.

- [#1226](https://github.com/bigcommerce/catalyst/pull/1226) [`d6d1224`](https://github.com/bigcommerce/catalyst/commit/d6d1224521d4304bbdb515763aaee402b1a97c94) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Rename `value` to `rating` for Rating component, remove unused props.

- [#1190](https://github.com/bigcommerce/catalyst/pull/1190) [`d01b4e0`](https://github.com/bigcommerce/catalyst/commit/d01b4e0560b1b8b2b3df9ed348231a2fc375f785) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove title prop from Tabs, remove Tabs from /account since it's not needed.

- [#1204](https://github.com/bigcommerce/catalyst/pull/1204) [`bde94ba`](https://github.com/bigcommerce/catalyst/commit/bde94bab5299b933047c58cd3c64a73022c039bc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add missing accisibility components to Quick Search.

- [#1200](https://github.com/bigcommerce/catalyst/pull/1200) [`51704d9`](https://github.com/bigcommerce/catalyst/commit/51704d9b9a7158c625c84f79e2ba95f98c6dc673) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Use the `geography` node to retrieve a list of countries. This removes one less dependency on the access token.

- [#1235](https://github.com/bigcommerce/catalyst/pull/1235) [`53ccd31`](https://github.com/bigcommerce/catalyst/commit/53ccd31f51e5b6d8f311a340d0bf70b7edb632aa) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add `Pagination` component.

- [#1211](https://github.com/bigcommerce/catalyst/pull/1211) [`ec81a3a`](https://github.com/bigcommerce/catalyst/commit/ec81a3a69182d015395d6dc7bfff1e9af2adb6f9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Update price prop in ProductCard to accept an object instead of a ReactNode.

- [#1208](https://github.com/bigcommerce/catalyst/pull/1208) [`315ed15`](https://github.com/bigcommerce/catalyst/commit/315ed154e1ccfe316dc4d1037e674b79c3bad308) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Move CompareDrawer to ui components.

- Updated dependencies [[`51704d9`](https://github.com/bigcommerce/catalyst/commit/51704d9b9a7158c625c84f79e2ba95f98c6dc673)]:
  - @bigcommerce/catalyst-client@0.6.0

## 0.12.0

### Minor Changes

- [#1178](https://github.com/bigcommerce/catalyst/pull/1178) [`f592d9f`](https://github.com/bigcommerce/catalyst/commit/f592d9fe0b71ddd7ceb5e1326ea0280f7b90c3c9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - This refactor changes the structure of our UI components by replacing composability with a prop-based configuration. This change simplifies the use of our components, eliminating the need to build them individually from a composable approach. Additionally, it provides a single location for all class customizations, improving the experience when fully customizing the component. We believe this approach will make it easier to use components correctly and safeguard against incorrect usage. Ultimately, by adopting a prop-based configuration, we aim to achieve full replaceability and simplify theming for our components.

  Before refactor:

  ```
  <Accordions>
      <AccordionsItem>
          <AccordionsTrigger>
              Title 1
          </AccordionsTrigger>
          <AccordionsContent>
              Item Content 1
          </AccordionsContent>
      </AccordionsItem>
      <AccordionsItem>
          <AccordionsTrigger>
              Title 2
          </AccordionsTrigger>
          <AccordionsContent>
              Item Content 2
          </AccordionsContent>
      </AccordionsItem>
  </Accordions>
  ```

  After refactor:

  ```
  <Accordions accordions={[
      {value: 'Title 1', content: 'Item Content 1'},
      {value: 'Title 2', content: 'Item Content 2'}
  ]}>
  ```

  Before refactor:

  ```
  <Select
      onValueChange={onSort}
      value={value}
  >
      <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="best_selling">Best selling</SelectItem>
          <SelectItem value="a_to_z">A to Z</SelectItem>
          <SelectItem value="z_to_a">Z to A</SelectItem>
          <SelectItem value="best_reviewed">By reviews</SelectItem>
          <SelectItem value="lowest_price">Price ascending</SelectItem>
          <SelectItem value="highest_price">Price descending</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
      </SelectContent>
  </Select>
  ```

  After refactor:

  ```
  <Select
      onValueChange={onSort}
      options={[
          { value: 'featured', label: 'Featured' },
          { value: 'newest', label: 'Newest' },
          { value: 'best_selling', label: 'Best selling' },
          { value: 'a_to_z', label: 'A to Z' },
          { value: 'z_to_a', label: 'Z to A' },
          { value: 'best_reviewed', label: 'By reviews'},
          { value: 'lowest_price', label: 'Price ascending' },
          { value: 'highest_price', label: 'Price descending' },
          { value: 'relevance', label: 'Relevance' },
      ]}
      value={value}
  />
  ```

## 0.11.0

### Minor Changes

- [#1156](https://github.com/bigcommerce/catalyst/pull/1156) [`7d91478`](https://github.com/bigcommerce/catalyst/commit/7d9147894deb17ca17048ac95b86e5a8a0def515) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds customer information onto the session for consumption in both server and client components

### Patch Changes

- [#1183](https://github.com/bigcommerce/catalyst/pull/1183) [`4e7ed57`](https://github.com/bigcommerce/catalyst/commit/4e7ed57979a82b04cc1fcb47025356c4b746db82) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Uses `next/navigation` for logging in as a customer instead of the built-in `redirectTo` option. That option was not following the `trailingSlash` config set in `next.config.js` which caused test failures.

- [#1179](https://github.com/bigcommerce/catalyst/pull/1179) [`ae8d985`](https://github.com/bigcommerce/catalyst/commit/ae8d985a89c229f945a596d7a905828dfcbe490e) Thanks [@deini](https://github.com/deini)! - bump next to 14.2.5

- Updated dependencies []:
  - @bigcommerce/catalyst-client@0.5.0

## 0.10.0

### Minor Changes

- [#1057](https://github.com/bigcommerce/catalyst/pull/1057) [`22dd481`](https://github.com/bigcommerce/catalyst/commit/22dd4818edea8ea9f7efc721a598cd978684ede5) Thanks [@bookernath](https://github.com/bookernath)! - Added /sitemap.xml as a proxy to hosted BigCommerce sitemap

### Patch Changes

- [#1098](https://github.com/bigcommerce/catalyst/pull/1098) [`405e791`](https://github.com/bigcommerce/catalyst/commit/405e791af8e7ecc1422f2ce18cb216a8c04cc73b) Thanks [@bookernath](https://github.com/bookernath)! - Move Sitemap Index fetching into the client & normalize user agents

- [#1086](https://github.com/bigcommerce/catalyst/pull/1086) [`e0926ee`](https://github.com/bigcommerce/catalyst/commit/e0926ee21664503f208dafcc8e5939c363801ee1) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add minor changes to address form layout

- [#1055](https://github.com/bigcommerce/catalyst/pull/1055) [`52214a3`](https://github.com/bigcommerce/catalyst/commit/52214a376bba1fdaa584de31c36f7d6cdc078624) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Make client.fetch channel aware per locale.

- [#1071](https://github.com/bigcommerce/catalyst/pull/1071) [`5d0975b`](https://github.com/bigcommerce/catalyst/commit/5d0975be8accd733e2ed909dba85f04d6d1042f5) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use customerId in product API to get correct product information.

- [#1077](https://github.com/bigcommerce/catalyst/pull/1077) [`e86f46f`](https://github.com/bigcommerce/catalyst/commit/e86f46fea3bd5630311d3afccb4b2d70aa68f6fe) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Uses the deployment URL for the robots.txt sitemap field rather than another environment variable.

- [#1075](https://github.com/bigcommerce/catalyst/pull/1075) [`4bf7d16`](https://github.com/bigcommerce/catalyst/commit/4bf7d1680df4a7dcc2adcdf24e4faf9e4e470726) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Append channel to kv keys.

- [#1034](https://github.com/bigcommerce/catalyst/pull/1034) [`e648a62`](https://github.com/bigcommerce/catalyst/commit/e648a62bed956a0c2ea43b9bc3ca68e009b57cfc) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add store selector page.

- [#1032](https://github.com/bigcommerce/catalyst/pull/1032) [`982b19c`](https://github.com/bigcommerce/catalyst/commit/982b19c5e80d4b427ec207cc0d72ef5014e4bee8) Thanks [@deini](https://github.com/deini)! - prefetch product option data on hover

- [#1095](https://github.com/bigcommerce/catalyst/pull/1095) [`5df38cf`](https://github.com/bigcommerce/catalyst/commit/5df38cf3b521e5b2077026e045f85e8ddbaee8a7) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fixes a missing GraphQL field for the updateCustomer mutation.

- [#1056](https://github.com/bigcommerce/catalyst/pull/1056) [`ad7bda7`](https://github.com/bigcommerce/catalyst/commit/ad7bda7387f25b04dc53b4df06ca8929791bc5d6) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - make selected account tab visible on mobile devices

- [#1087](https://github.com/bigcommerce/catalyst/pull/1087) [`b21a139`](https://github.com/bigcommerce/catalyst/commit/b21a139c447eeb132a2cabef3951f0cb7f779341) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - change pagination layout and minor changes to address book

- Updated dependencies [[`405e791`](https://github.com/bigcommerce/catalyst/commit/405e791af8e7ecc1422f2ce18cb216a8c04cc73b), [`8766305`](https://github.com/bigcommerce/catalyst/commit/8766305b65ca10422e7921b2fd15796e0a09d27a), [`52214a3`](https://github.com/bigcommerce/catalyst/commit/52214a376bba1fdaa584de31c36f7d6cdc078624)]:
  - @bigcommerce/catalyst-client@0.5.0

## 0.9.1

### Patch Changes

- [#937](https://github.com/bigcommerce/catalyst/pull/937) [`3606639`](https://github.com/bigcommerce/catalyst/commit/3606639e294465cd10aab217c8c74be7cd7a8754) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show correct status and messaging for the Add to Cart button.

- [#979](https://github.com/bigcommerce/catalyst/pull/979) [`6a6c193`](https://github.com/bigcommerce/catalyst/commit/6a6c1938a05a639212afc41241b4e1cb4cf6cd88) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - fix redirection to the Login page after password change

- [#972](https://github.com/bigcommerce/catalyst/pull/972) [`3c34e27`](https://github.com/bigcommerce/catalyst/commit/3c34e276d7b735394aa3c9d6205f18b5407ca7a4) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show correct color of remove button when in loading state.

- [#982](https://github.com/bigcommerce/catalyst/pull/982) [`b8ea900`](https://github.com/bigcommerce/catalyst/commit/b8ea9006a621a9d5f549e4fa1c6bbccb72c3b1ec) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Introduces more consistent naming convention for files related to GraphQL, changes opinions around when it is appropriate to track GraphQL files in version control, fixes an issue where the `generate.cjs` script was swallowing helpful error messaging

- [#977](https://github.com/bigcommerce/catalyst/pull/977) [`bf4739d`](https://github.com/bigcommerce/catalyst/commit/bf4739d0977deb69f3bc1cf0e70f4c96b60c6d89) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add upstash kv adapter.

- [#974](https://github.com/bigcommerce/catalyst/pull/974) [`970651c`](https://github.com/bigcommerce/catalyst/commit/970651c159553983f665a8951419cdd3d977fc02) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add loading state to remove coupon code button.

## 0.9.0

### Minor Changes

- [#794](https://github.com/bigcommerce/catalyst/pull/794) [`956d738`](https://github.com/bigcommerce/catalyst/commit/956d7389bce81e8af8e8cdbe0bae78e3b3f20423) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add update customer form

### Patch Changes

- [#942](https://github.com/bigcommerce/catalyst/pull/942) [`c7c65e0`](https://github.com/bigcommerce/catalyst/commit/c7c65e002d6f473292713c4c5ffa4ab2690cc6f8) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Make select scrollable with popover functionality.

- [#957](https://github.com/bigcommerce/catalyst/pull/957) [`0a3b519`](https://github.com/bigcommerce/catalyst/commit/0a3b5191d1eba6ea70eeb91ef39638d5a6fbf1ca) Thanks [@deini](https://github.com/deini)! - fix custom 404 page not being used

- [#941](https://github.com/bigcommerce/catalyst/pull/941) [`19a3d14`](https://github.com/bigcommerce/catalyst/commit/19a3d147b6b12b38d974649c147a709c0d47557a) Thanks [@bc-yevhenii-buliuk](https://github.com/bc-yevhenii-buliuk)! - update icons on the account page

- [#811](https://github.com/bigcommerce/catalyst/pull/811) [`6661e3e`](https://github.com/bigcommerce/catalyst/commit/6661e3e56e1cc703506f5ee509a7377fb19174f0) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add new address for customer

## 0.8.0

### Minor Changes

- [#704](https://github.com/bigcommerce/catalyst/pull/704) [`6e93873`](https://github.com/bigcommerce/catalyst/commit/6e9387326cebf139bb7fb2459f5b9f29c81c876f) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add change password for logged-in customer

- [#730](https://github.com/bigcommerce/catalyst/pull/730) [`15e4b82`](https://github.com/bigcommerce/catalyst/commit/15e4b82845979e0ea92aae531055552636d433fb) Thanks [@yurytut1993](https://github.com/yurytut1993)! - create register customer page

### Patch Changes

- [#922](https://github.com/bigcommerce/catalyst/pull/922) [`321f67f`](https://github.com/bigcommerce/catalyst/commit/321f67f0f6576f2f6169e3d804705c7a82a9fb1a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix incorrect sale price showing when no sale was active in Cart

- [#896](https://github.com/bigcommerce/catalyst/pull/896) [`b13fecf`](https://github.com/bigcommerce/catalyst/commit/b13fecfa145ceb489553511221f76533d65d6bf9) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Modify Cart page layout to fix mobile rendering issues.

- [#787](https://github.com/bigcommerce/catalyst/pull/787) [`6198648`](https://github.com/bigcommerce/catalyst/commit/6198648c563be61ac6a5a413a005ed63a7d43a58) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add delete address functionality for account

- [#909](https://github.com/bigcommerce/catalyst/pull/909) [`bf0e326`](https://github.com/bigcommerce/catalyst/commit/bf0e326e446d3014ae9a3c352173ee1e547f3de8) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Show original price of Cart item when on sale

- [#912](https://github.com/bigcommerce/catalyst/pull/912) [`5ec3d76`](https://github.com/bigcommerce/catalyst/commit/5ec3d76c3af5847604dedfa9c6d1c870246808ef) Thanks [@deini](https://github.com/deini)! - fetch checkout redirect url when user clicks proceed to checkout button

- [#916](https://github.com/bigcommerce/catalyst/pull/916) [`ff231c9`](https://github.com/bigcommerce/catalyst/commit/ff231c9c5d8ae5470fea61de7d42494b68b9f469) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add Button with loading state.

- [#918](https://github.com/bigcommerce/catalyst/pull/918) [`f16936a`](https://github.com/bigcommerce/catalyst/commit/f16936a057de212baafad9e62f556d0d4bb2bfae) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix issue with account dropdown in header.

- [#919](https://github.com/bigcommerce/catalyst/pull/919) [`cde181e`](https://github.com/bigcommerce/catalyst/commit/cde181e4a3a768401bda6471562a8128dff3dcb2) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix broken Slot functionality in Button

- [#910](https://github.com/bigcommerce/catalyst/pull/910) [`d0352c0`](https://github.com/bigcommerce/catalyst/commit/d0352c08b43e76b4cd838cb7916f9993228e3fa0) Thanks [@deini](https://github.com/deini)! - removes fetch cart redirect from client and fetch it with gql

- [#880](https://github.com/bigcommerce/catalyst/pull/880) [`af61999`](https://github.com/bigcommerce/catalyst/commit/af619997002f33b2a9a5276467ac632218cfc2f8) Thanks [@deini](https://github.com/deini)! - Category pages now use the `categoryEntityId` filter

- Updated dependencies [[`d0352c0`](https://github.com/bigcommerce/catalyst/commit/d0352c08b43e76b4cd838cb7916f9993228e3fa0)]:
  - @bigcommerce/catalyst-client@0.4.0

## 0.7.0

### Minor Changes

- [#748](https://github.com/bigcommerce/catalyst/pull/748) [`dc03f50`](https://github.com/bigcommerce/catalyst/commit/dc03f50bb1734b26bd15ecf9c1f7fb6e34d3e86c) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add customer addresses tab content

- [#760](https://github.com/bigcommerce/catalyst/pull/760) [`d3cb5bd`](https://github.com/bigcommerce/catalyst/commit/d3cb5bd51966aa1bf38453aba2a125f517869931) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add dialog component

### Patch Changes

- [#786](https://github.com/bigcommerce/catalyst/pull/786) [`8e6328f`](https://github.com/bigcommerce/catalyst/commit/8e6328fb577e91eede49a92eafa113c5778520de) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Apply the edge runtime to missing routes.

- [#816](https://github.com/bigcommerce/catalyst/pull/816) [`7115843`](https://github.com/bigcommerce/catalyst/commit/711584393f829873ad8d3d48495f1aafa777e46d) Thanks [@avattipalli](https://github.com/avattipalli)! - Move functional tests to apps/core

- [#776](https://github.com/bigcommerce/catalyst/pull/776) [`656693e`](https://github.com/bigcommerce/catalyst/commit/656693ed1ac30a162025b58763fa7beb4dfaad18) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add update customer mutation

- [#845](https://github.com/bigcommerce/catalyst/pull/845) [`dfd5b25`](https://github.com/bigcommerce/catalyst/commit/dfd5b25659cb90e909e73764f246f19322f60a4c) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove additional references to @bigcommerce/components.

- [#808](https://github.com/bigcommerce/catalyst/pull/808) [`c0bca5d`](https://github.com/bigcommerce/catalyst/commit/c0bca5d12257218908dcca54b31d32bf84d087fb) Thanks [@jorgemoya](https://github.com/jorgemoya)! - use next-intl formatter to properly localize dates & prices

- [#854](https://github.com/bigcommerce/catalyst/pull/854) [`0758464`](https://github.com/bigcommerce/catalyst/commit/0758464e4c43ab33e470bb91223249b01e36e780) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Respect isVisibleInNavigation for blog pages

- [#779](https://github.com/bigcommerce/catalyst/pull/779) [`fe34b3e`](https://github.com/bigcommerce/catalyst/commit/fe34b3ed79992f73084214b369b7750141a17c39) Thanks [@deini](https://github.com/deini)! - use LRU cache for DevKvAdapter

- [#789](https://github.com/bigcommerce/catalyst/pull/789) [`86403a6`](https://github.com/bigcommerce/catalyst/commit/86403a6fc66f52f93ace611631614c2844af5a87) Thanks [@deini](https://github.com/deini)! - best-effort in memory cache for vercel kv adapter

- [#815](https://github.com/bigcommerce/catalyst/pull/815) [`984c30c`](https://github.com/bigcommerce/catalyst/commit/984c30ca51601fb8f1c0f6c83bce40c3650f9b23) Thanks [@deini](https://github.com/deini)! - pin nextjs version

- [#814](https://github.com/bigcommerce/catalyst/pull/814) [`c0b5df4`](https://github.com/bigcommerce/catalyst/commit/c0b5df458f049d73b9cfb17426f132f827e4574f) Thanks [@jorgemoya](https://github.com/jorgemoya)! - standardize mutations by returning drilled response

- [#759](https://github.com/bigcommerce/catalyst/pull/759) [`3602d91`](https://github.com/bigcommerce/catalyst/commit/3602d91144513ad0c14b646f2cfc68791d3c3198) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add delete customer address mutation

- [#767](https://github.com/bigcommerce/catalyst/pull/767) [`c740cdd`](https://github.com/bigcommerce/catalyst/commit/c740cdd1b561b7abaab7390a8dfcab4d65c89d73) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Move /packages/components into core, update related configurations.

- [#798](https://github.com/bigcommerce/catalyst/pull/798) [`56f3c48`](https://github.com/bigcommerce/catalyst/commit/56f3c4824dd0b31212c15b124cb29be79548fbf2) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update `tailwindFunctions` to use the correct className utility function `cn`.

- [#769](https://github.com/bigcommerce/catalyst/pull/769) [`1fa1c38`](https://github.com/bigcommerce/catalyst/commit/1fa1c38382871b78c3f51cbcf049532e1b05bbbc) Thanks [@avattipalli](https://github.com/avattipalli)! - add accessible attr for select component

- [#810](https://github.com/bigcommerce/catalyst/pull/810) [`168cdda`](https://github.com/bigcommerce/catalyst/commit/168cddae51638a24a0fb53a3a2f5a5e03a7a4b38) Thanks [@deini](https://github.com/deini)! - split contact us and normal websites into individual pages

- [#777](https://github.com/bigcommerce/catalyst/pull/777) [`fe5c221`](https://github.com/bigcommerce/catalyst/commit/fe5c221aa6e4a4049e89f69e177d722ee94b6f62) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add customer address mutation

- [#831](https://github.com/bigcommerce/catalyst/pull/831) [`8349bbf`](https://github.com/bigcommerce/catalyst/commit/8349bbf928dee722fadb5c2119b41756bffaa317) Thanks [@jorgemoya](https://github.com/jorgemoya)! - chore: standardize actions

- [#783](https://github.com/bigcommerce/catalyst/pull/783) [`301b775`](https://github.com/bigcommerce/catalyst/commit/301b775ef967b72ab9d3930eb7ec7488876b48b4) Thanks [@jorgemoya](https://github.com/jorgemoya)! - add loading state on item quantity update and remove when quantity equals 0

- [#852](https://github.com/bigcommerce/catalyst/pull/852) [`3b7ec09`](https://github.com/bigcommerce/catalyst/commit/3b7ec09c26af506f48259806f8d06e4ba8493bc2) Thanks [@electricenjindevops](https://github.com/electricenjindevops)! - Conditionally show featuredProducts on 404 page.

- [#836](https://github.com/bigcommerce/catalyst/pull/836) [`6cbfd02`](https://github.com/bigcommerce/catalyst/commit/6cbfd02e3621e3be72dfc4db6292f66d1575eb95) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Bump react to v18.3.1

- [#793](https://github.com/bigcommerce/catalyst/pull/793) [`76fad25`](https://github.com/bigcommerce/catalyst/commit/76fad25074afaf5b15f9989fa2a6038af96bfdeb) Thanks [@deini](https://github.com/deini)! - use --turbo for next dev

- [#873](https://github.com/bigcommerce/catalyst/pull/873) [`1c7f52f`](https://github.com/bigcommerce/catalyst/commit/1c7f52f13d9dc6faf8bd039c2208fac76ed88d03) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set a min width to body.

- [#838](https://github.com/bigcommerce/catalyst/pull/838) [`7a0e393`](https://github.com/bigcommerce/catalyst/commit/7a0e39369b5971be3036e0678455ec82bcb5e321) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Respects when `CLIENT_LOGGER="false"` or `KV_LOGGER="false"` is set in .env.local regardless of environment.

- [#773](https://github.com/bigcommerce/catalyst/pull/773) [`7f70719`](https://github.com/bigcommerce/catalyst/commit/7f7071962a091671c64e376598950c2d6fa3ec1d) Thanks [@deini](https://github.com/deini)! - check for auth on /account pages

- [#771](https://github.com/bigcommerce/catalyst/pull/771) [`8af0878`](https://github.com/bigcommerce/catalyst/commit/8af08780469f1ee0ecdf63449aa7a31c2b965c9e) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Add missing `Cart.spinnerText` translation.

- [#778](https://github.com/bigcommerce/catalyst/pull/778) [`32c3373`](https://github.com/bigcommerce/catalyst/commit/32c33730364241d78ea2fb9817d1543bdd1c1e23) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add update address mutation

- [#877](https://github.com/bigcommerce/catalyst/pull/877) [`017fa61`](https://github.com/bigcommerce/catalyst/commit/017fa6178dcbd99ee41d84f71dbe263cfcd76181) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Set mobile padding to 16px instead of 24px

- [#875](https://github.com/bigcommerce/catalyst/pull/875) [`78a5f08`](https://github.com/bigcommerce/catalyst/commit/78a5f088e6dc4da5b804e2acee74f9d79ecb6ef7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix header overflow in mobile, hide search when screen width is extra small."

- [#743](https://github.com/bigcommerce/catalyst/pull/743) [`30c7624`](https://github.com/bigcommerce/catalyst/commit/30c7624b4430d76ef3efea1314c18c3b400b966d) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add customer addresses query

- [#768](https://github.com/bigcommerce/catalyst/pull/768) [`39feb4a`](https://github.com/bigcommerce/catalyst/commit/39feb4a7773719670a394edc19e5e391905158ba) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add get customer query

- [#846](https://github.com/bigcommerce/catalyst/pull/846) [`e2f4311`](https://github.com/bigcommerce/catalyst/commit/e2f43116e9038f676ea0520bb96de7d16bec6424) Thanks [@avattipalli](https://github.com/avattipalli)! - Migrate visual regression tests

## 0.6.0

### Minor Changes

- [#753](https://github.com/bigcommerce/catalyst/pull/753) [`48c040e`](https://github.com/bigcommerce/catalyst/commit/48c040e94745134f4c60b15cadcdb0a0bbcb2a36) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Deprecate `node@18` in favor of latest LTS version `node@20`.

### Patch Changes

- [#755](https://github.com/bigcommerce/catalyst/pull/755) [`6a6af43`](https://github.com/bigcommerce/catalyst/commit/6a6af432d95a221b1685328bd5211fb6fea8ad55) Thanks [@deini](https://github.com/deini)! - pin next version

- [#757](https://github.com/bigcommerce/catalyst/pull/757) [`dac0199`](https://github.com/bigcommerce/catalyst/commit/dac019989c9c1a81526689dc9e75c9d3a0d0dce3) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Update cart select components to use the item-aligned select content in order to scroll with large Select content.

- Updated dependencies [[`48c040e`](https://github.com/bigcommerce/catalyst/commit/48c040e94745134f4c60b15cadcdb0a0bbcb2a36), [`dac0199`](https://github.com/bigcommerce/catalyst/commit/dac019989c9c1a81526689dc9e75c9d3a0d0dce3)]:
  - @bigcommerce/catalyst-client@0.3.0
  - @bigcommerce/components@0.3.0

## 0.5.0

### Minor Changes

- [#719](https://github.com/bigcommerce/catalyst/pull/719) [`ab67b34`](https://github.com/bigcommerce/catalyst/commit/ab67b34ea1c6c7b4b5192a0fe2455ab79f001a97) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add tabs for customer account

### Patch Changes

- [#740](https://github.com/bigcommerce/catalyst/pull/740) [`d586c21`](https://github.com/bigcommerce/catalyst/commit/d586c2122bf6513b2f7d923957636c7ea8aaf2ce) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump next-auth and use string for user id

- [#749](https://github.com/bigcommerce/catalyst/pull/749) [`5041719`](https://github.com/bigcommerce/catalyst/commit/5041719a753ef36472f9cfac79bbca32b540b6e5) Thanks [@deini](https://github.com/deini)! - fix social icons type errors with latest @types/react

- [#750](https://github.com/bigcommerce/catalyst/pull/750) [`c8973e2`](https://github.com/bigcommerce/catalyst/commit/c8973e2051042e832859f8c559d0fff456e2a621) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add loading state to remove item button in Cart

- [#724](https://github.com/bigcommerce/catalyst/pull/724) [`045cd14`](https://github.com/bigcommerce/catalyst/commit/045cd14f9846ec939a6237c42f57e849425fa4dd) Thanks [@christensenep](https://github.com/christensenep)! - Support serving static pages when the cart is not empty

- Updated dependencies [[`d586c21`](https://github.com/bigcommerce/catalyst/commit/d586c2122bf6513b2f7d923957636c7ea8aaf2ce)]:
  - @bigcommerce/catalyst-client@0.2.2

## 0.4.0

### Minor Changes

- [#733](https://github.com/bigcommerce/catalyst/pull/733) [`565e871`](https://github.com/bigcommerce/catalyst/commit/565e87173056fe944c94a004a84947ae93e84c00) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Allow applying and removing coupons in cart

- [#716](https://github.com/bigcommerce/catalyst/pull/716) [`b1a2939`](https://github.com/bigcommerce/catalyst/commit/b1a29398fcde23e67c19bb579e714bcde39839cb) Thanks [@bookernath](https://github.com/bookernath)! - Prefetch high-intent cart link immediately after add to cart action

- [#638](https://github.com/bigcommerce/catalyst/pull/638) [`a1f7970`](https://github.com/bigcommerce/catalyst/commit/a1f797098eee668b4f8bf6763100d71d3882cb45) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add reset password functionality
  Update props for message field

- [#665](https://github.com/bigcommerce/catalyst/pull/665) [`980e481`](https://github.com/bigcommerce/catalyst/commit/980e481767b2305e4e8374c2880018b1637525f0) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add components for change password

### Patch Changes

- [#713](https://github.com/bigcommerce/catalyst/pull/713) [`643033a`](https://github.com/bigcommerce/catalyst/commit/643033abb973942cbe2ff30bd7e2a539fa7984ed) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fetch and show digital items in Cart summary.

- [#711](https://github.com/bigcommerce/catalyst/pull/711) [`0ec2269`](https://github.com/bigcommerce/catalyst/commit/0ec22699a3313e4ad7473d12fe13e9a8549f9415) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use checkout field from GQL to populate checkout summary.

- [#732](https://github.com/bigcommerce/catalyst/pull/732) [`ea5a690`](https://github.com/bigcommerce/catalyst/commit/ea5a6900fa59f73f44537cd3a3095ce4a91e26cf) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Hide discounts if null

- [#722](https://github.com/bigcommerce/catalyst/pull/722) [`b3cddde`](https://github.com/bigcommerce/catalyst/commit/b3cdddecabdbc57e8e6454fa02978bc0216527f7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Preselect first state when country is selected for Shipping Info

- [#734](https://github.com/bigcommerce/catalyst/pull/734) [`86e57a1`](https://github.com/bigcommerce/catalyst/commit/86e57a18db651cbc8df0e1b8ce7c46d0c0c4087a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Pass customer id to shipping mutation that were missing.

- [#728](https://github.com/bigcommerce/catalyst/pull/728) [`fa83629`](https://github.com/bigcommerce/catalyst/commit/fa8362917efcf572976628619d9da4859c9dcd47) Thanks [@christensenep](https://github.com/christensenep)! - Fix breadcrumbs on PDP to have correct links

- [#731](https://github.com/bigcommerce/catalyst/pull/731) [`41ebe00`](https://github.com/bigcommerce/catalyst/commit/41ebe001a14e766cab5b75a87f639a0b081bcac0) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Add tax total in checkout summary

- [#735](https://github.com/bigcommerce/catalyst/pull/735) [`3db9c5f`](https://github.com/bigcommerce/catalyst/commit/3db9c5fa603299a5c5a9a12bd5408f9024677b20) Thanks [@deini](https://github.com/deini)! - Bump dependencies

- [#683](https://github.com/bigcommerce/catalyst/pull/683) [`cfab55b`](https://github.com/bigcommerce/catalyst/commit/cfab55b374f61f89a9de6a09a8cb3daa93ca48d6) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - add change password mutation for logged in customer

- Updated dependencies [[`a1f7970`](https://github.com/bigcommerce/catalyst/commit/a1f797098eee668b4f8bf6763100d71d3882cb45), [`5af4856`](https://github.com/bigcommerce/catalyst/commit/5af4856510406080d75a1e1db16fe55f86082264), [`3db9c5f`](https://github.com/bigcommerce/catalyst/commit/3db9c5fa603299a5c5a9a12bd5408f9024677b20), [`e4dab93`](https://github.com/bigcommerce/catalyst/commit/e4dab93222b2a19d469315266b2d4627a7967294)]:
  - @bigcommerce/components@0.2.0
  - @bigcommerce/catalyst-client@0.2.1

## 0.3.0

### Minor Changes

- [#696](https://github.com/bigcommerce/catalyst/pull/696) [`6deba4a`](https://github.com/bigcommerce/catalyst/commit/6deba4a0713b0d14a76439f0cd01baf35f5185e2) Thanks [@deini](https://github.com/deini)! - removes graphql codegen setup, all graphql calls are done using gql.tada

### Patch Changes

- [#694](https://github.com/bigcommerce/catalyst/pull/694) [`b0c912b`](https://github.com/bigcommerce/catalyst/commit/b0c912bfcefe8c6a9dc46d667f9f96124d1ad132) Thanks [@onurstats](https://github.com/onurstats)! - fix login form translation key mismatch

- [#697](https://github.com/bigcommerce/catalyst/pull/697) [`fbc49e1`](https://github.com/bigcommerce/catalyst/commit/fbc49e144f0eadd7824cae81a46ddff523eb30a3) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add customer & address form fields queries

## 0.2.1

### Patch Changes

- [#641](https://github.com/bigcommerce/catalyst/pull/641) [`43b1afd`](https://github.com/bigcommerce/catalyst/commit/43b1afdf8d9977daf329d0e828e73ea8c8b49acb) Thanks [@yurytut1993](https://github.com/yurytut1993)! - add register customer mutation

- Updated dependencies [[`ac733cc`](https://github.com/bigcommerce/catalyst/commit/ac733cc0308b3ebe1189fe6a7d20214dbc382b3f), [`5af0e66`](https://github.com/bigcommerce/catalyst/commit/5af0e66e7b065ea1d158a0d062a6c3216752d5be)]:
  - @bigcommerce/catalyst-client@0.2.0
  - @bigcommerce/components@0.1.2

## 0.2.0

### Minor Changes

- [#662](https://github.com/bigcommerce/catalyst/pull/662) [`be5fc87`](https://github.com/bigcommerce/catalyst/commit/be5fc8787c4e9078c0e032c508f5ccd167421416) Thanks [@deini](https://github.com/deini)! - export a graphql() powered by gql.tada

- [#666](https://github.com/bigcommerce/catalyst/pull/666) [`51a2b64`](https://github.com/bigcommerce/catalyst/commit/51a2b6456ae9ef02569f8eb1380c6deb69b6c55d) Thanks [@deini](https://github.com/deini)! - use gql.tada on simple queries

- [#658](https://github.com/bigcommerce/catalyst/pull/658) [`8ff2eb6`](https://github.com/bigcommerce/catalyst/commit/8ff2eb65acaf973cf7d30833c14238338c57ec44) Thanks [@matthewvolk](https://github.com/matthewvolk)! - create graphql schema using gql.tada

- [#663](https://github.com/bigcommerce/catalyst/pull/663) [`faa2330`](https://github.com/bigcommerce/catalyst/commit/faa23305f6be273320de7caa1e451cef0a748215) Thanks [@deini](https://github.com/deini)! - use gql.tada on all mutations

- [#671](https://github.com/bigcommerce/catalyst/pull/671) [`9c5bb8c`](https://github.com/bigcommerce/catalyst/commit/9c5bb8cd9d9b7bf5a1632d9b9cc998950fd993e7) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Hide handling cost in shipping estimate if there is no cost associated.

### Patch Changes

- [#659](https://github.com/bigcommerce/catalyst/pull/659) [`35e5c96`](https://github.com/bigcommerce/catalyst/commit/35e5c9658d28e167d27a3eb77e455f40f023ed03) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use amount and discount values for cart summary in Cart page

- [#669](https://github.com/bigcommerce/catalyst/pull/669) [`b657f6c`](https://github.com/bigcommerce/catalyst/commit/b657f6c9f9d56ba45cc09a9fa78f0eb684425204) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Use correct font weight and size for Grand Total in Cart Summary

- [#660](https://github.com/bigcommerce/catalyst/pull/660) [`46b0656`](https://github.com/bigcommerce/catalyst/commit/46b06562e07f3e2ef44803758bfe3d2c7ae49455) Thanks [@deini](https://github.com/deini)! - fix auth imports, was causing issues with --turbo

- [#668](https://github.com/bigcommerce/catalyst/pull/668) [`58ca3eb`](https://github.com/bigcommerce/catalyst/commit/58ca3eb943332aaede6e5a41550cfb0ab048c87a) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Fix on hover style for buttons in Shipping Estimator

## 0.1.1

### Patch Changes

- [#645](https://github.com/bigcommerce/catalyst/pull/645) [`ac57f18`](https://github.com/bigcommerce/catalyst/commit/ac57f189845f6b87e12cd2ac0352301226cf8f50) Thanks [@christensenep](https://github.com/christensenep)! - Add intl provider to No Search Results page

- [#644](https://github.com/bigcommerce/catalyst/pull/644) [`a2ce3b5`](https://github.com/bigcommerce/catalyst/commit/a2ce3b5caf37dcd75cf449648ce3e5b795dc80f7) Thanks [@christensenep](https://github.com/christensenep)! - Use focus-visible instead of focus for focus-related styling

- [#628](https://github.com/bigcommerce/catalyst/pull/628) [`e35d947`](https://github.com/bigcommerce/catalyst/commit/e35d9472d8654847dc5f67ba175e00125c83fabd) Thanks [@bc-alexsaiannyi](https://github.com/bc-alexsaiannyi)! - Add mutations for reset password

- Updated dependencies [[`a2ce3b5`](https://github.com/bigcommerce/catalyst/commit/a2ce3b5caf37dcd75cf449648ce3e5b795dc80f7)]:
  - @bigcommerce/components@0.1.1
    All notable changes to this project will be documented in this file.
