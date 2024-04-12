# Changelog

## 0.5.0

### Minor Changes

- [#753](https://github.com/bigcommerce/catalyst/pull/753) [`48c040e`](https://github.com/bigcommerce/catalyst/commit/48c040e94745134f4c60b15cadcdb0a0bbcb2a36) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Deprecate `node@18` in favor of latest LTS version `node@20`.

## 0.4.1

### Patch Changes

- [#740](https://github.com/bigcommerce/catalyst/pull/740) [`d586c21`](https://github.com/bigcommerce/catalyst/commit/d586c2122bf6513b2f7d923957636c7ea8aaf2ce) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump next-auth and use string for user id

## 0.4.0

### Minor Changes

- [#712](https://github.com/bigcommerce/catalyst/pull/712) [`8ad9d15`](https://github.com/bigcommerce/catalyst/commit/8ad9d15ffd6cb1cc0a53b2df1eff76efe21527a4) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Change the default GitHub Ref that the CLI uses to clone `bigcommerce/catalyst-core` from `main` to latest published release (e.g., `@bigcommerce/catalyst-core@0.3.0`)

### Patch Changes

- [#735](https://github.com/bigcommerce/catalyst/pull/735) [`3db9c5f`](https://github.com/bigcommerce/catalyst/commit/3db9c5fa603299a5c5a9a12bd5408f9024677b20) Thanks [@deini](https://github.com/deini)! - Bump dependencies

## 0.3.0

### Minor Changes

- [#696](https://github.com/bigcommerce/catalyst/pull/696) [`6deba4a`](https://github.com/bigcommerce/catalyst/commit/6deba4a0713b0d14a76439f0cd01baf35f5185e2) Thanks [@deini](https://github.com/deini)! - removes graphql codegen setup, all graphql calls are done using gql.tada

### Patch Changes

- [#699](https://github.com/bigcommerce/catalyst/pull/699) [`30f6515`](https://github.com/bigcommerce/catalyst/commit/30f65153a94abf689b053fbc9acff3cd297398c0) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Support `@` characters in the `create-catalyst` `--gh-ref` CLI flag

## 0.2.2

### Patch Changes

- [#686](https://github.com/bigcommerce/catalyst/pull/686) [`278ad5f`](https://github.com/bigcommerce/catalyst/commit/278ad5f9d389b8cb20dd32007850e937b8d494bd) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Install latest versions of all Catalyst workspace dependencies during project creation

## 0.2.1

### Patch Changes

- [#684](https://github.com/bigcommerce/catalyst/pull/684) [`1e12797`](https://github.com/bigcommerce/catalyst/commit/1e127977eedca306c58f3e243d7367f52ea7f077) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adjust order of `package.json` properties created by the CLI

## 0.2.0

### Minor Changes

- [#658](https://github.com/bigcommerce/catalyst/pull/658) [`8ff2eb6`](https://github.com/bigcommerce/catalyst/commit/8ff2eb65acaf973cf7d30833c14238338c57ec44) Thanks [@matthewvolk](https://github.com/matthewvolk)! - create graphql schema using gql.tada

### Patch Changes

- [#670](https://github.com/bigcommerce/catalyst/pull/670) [`efd6387`](https://github.com/bigcommerce/catalyst/commit/efd63874361726077798bf29a1f531c58bfdd0aa) Thanks [@matthewvolk](https://github.com/matthewvolk)! - use `--prefix` npm flag to set `cwd` for GraphQL schema generation insead of `exec`'s `cwd` option

## 0.1.1

### Patch Changes

- [#648](https://github.com/bigcommerce/catalyst/pull/648) [`604f60a`](https://github.com/bigcommerce/catalyst/commit/604f60a7550a10de9e8127b4c195998b70fb98df) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Bump `zod-validation-error` in `@bigcommerce/create-catalyst` to `^3.0.3`. This fixes a recently discovered bug that was caused by `zod-validation-error@3.0.2`.

- [#653](https://github.com/bigcommerce/catalyst/pull/653) [`ffaa8ee`](https://github.com/bigcommerce/catalyst/commit/ffaa8eef6da0b96bef58ab0a9b00e34c08cb3535) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Update `@bigcommerce/create-catalyst` readme with more detailed usage
  All notable changes to this project will be documented in this file.
