# Changelog

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
