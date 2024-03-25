# Changelog

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
