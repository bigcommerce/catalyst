# Changelog

## 0.14.3

### Patch Changes

- [#1492](https://github.com/bigcommerce/catalyst/pull/1492) [`0b28a4c`](https://github.com/bigcommerce/catalyst/commit/0b28a4c7d8f71f677e81788655d2bc70d41c4882) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Default to the `create` command when running the preCommand hook.

## 0.14.2

### Patch Changes

- [#1488](https://github.com/bigcommerce/catalyst/pull/1488) [`1bbc3f8`](https://github.com/bigcommerce/catalyst/commit/1bbc3f85fd56572b3a6cfe24e5be551d0e8f8488) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Noop commit to rebuild CLI.

## 0.14.1

### Patch Changes

- [#1480](https://github.com/bigcommerce/catalyst/pull/1480) [`eb1707b`](https://github.com/bigcommerce/catalyst/commit/eb1707b7845f9f6ca68afa32c1469459c58b9505) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Fix the CLI from hanging while waiting for segment.

## 0.14.0

### Minor Changes

- [#1478](https://github.com/bigcommerce/catalyst/pull/1478) [`7d66252`](https://github.com/bigcommerce/catalyst/commit/7d6625263bf87aa19b6c05c190729d8b147ca7a8) Thanks [@bookernath](https://github.com/bookernath)! - Update OAuth scopes to future needs

- [#1479](https://github.com/bigcommerce/catalyst/pull/1479) [`a7ce4b3`](https://github.com/bigcommerce/catalyst/commit/a7ce4b341ad8b69a001e03ff5050e3c70c7dca1b) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds telemetry collection to the CLI. If users want to opt out of CLI telemetry collection, use `pnpm create @bigcommerce/catalyst telemetry disable` or use the `CATALYST_TELEMETRY_DISABLED` environment variable to opt-out.

## 0.13.0

### Minor Changes

- [#1443](https://github.com/bigcommerce/catalyst/pull/1443) [`c166d53`](https://github.com/bigcommerce/catalyst/commit/c166d536394ec8b32831aa384868d0cabc5d86e2) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Remove automatic generation of GraphQL type definitions on project creation. This results in faster project creation and generation will happen already as part of starting the development sever or kicking off a build

- [#1438](https://github.com/bigcommerce/catalyst/pull/1438) [`d12c0d2`](https://github.com/bigcommerce/catalyst/commit/d12c0d22ec121f0effb95e1fab347a05ca84c7af) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Refactor `cloneCatalyst` so that it simply clones the `bigcommerce/catalyst` repo, configures remotes, and checks out an optional ref

- [#1440](https://github.com/bigcommerce/catalyst/pull/1440) [`5b3cbbd`](https://github.com/bigcommerce/catalyst/commit/5b3cbbd75ec05b6a21062b600a930f15e1c004a4) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Refactor `installDependencies` so that it installs all dependencies found in the root package.json file of the monorepo

- [#1435](https://github.com/bigcommerce/catalyst/pull/1435) [`b38209f`](https://github.com/bigcommerce/catalyst/commit/b38209f93345ebc6584fe3486e10ca5baadf17ec) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Ensure `pnpm` is installed on the machine running the CLI

- [#1434](https://github.com/bigcommerce/catalyst/pull/1434) [`c105d07`](https://github.com/bigcommerce/catalyst/commit/c105d07695f1d1070ce6774e4b33037633e97e28) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Change required Node.js version to `^20` (instead of `>=20`)

- [#1441](https://github.com/bigcommerce/catalyst/pull/1441) [`5463157`](https://github.com/bigcommerce/catalyst/commit/5463157ed6060880dd22e60e1c7caba38dd3cbb5) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Remove `pm` utility because the package manager must be `pnpm` when working in the monorepo

- [#1436](https://github.com/bigcommerce/catalyst/pull/1436) [`673bea2`](https://github.com/bigcommerce/catalyst/commit/673bea2bef3d7b80267c7f0c8b204b652fd09f34) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Ensure `git` is installed on the machine running the CLI

- [#1437](https://github.com/bigcommerce/catalyst/pull/1437) [`6db8527`](https://github.com/bigcommerce/catalyst/commit/6db8527042d3c0b04b6b0a61c56f3cc2ef8eeff7) Thanks [@matthewvolk](https://github.com/matthewvolk)! - BREAKING: Remove `applyIntegrations`. Integrations will now be applied by simply fetching the appropriate remote `integrations/*` branch from upstream, and cherry-picking the integration code

### Patch Changes

- [#1439](https://github.com/bigcommerce/catalyst/pull/1439) [`addf5e9`](https://github.com/bigcommerce/catalyst/commit/addf5e98a08427631e03ef152efe6949a5d01b9e) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Removes unused `getLatestCoreTag` function

- [#1433](https://github.com/bigcommerce/catalyst/pull/1433) [`ea74be2`](https://github.com/bigcommerce/catalyst/commit/ea74be2b0c066b8f9e99c1e1b64ef1b97ea4b7f5) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Add function to allow user to specify an arbitrary ref to checkout after cloning

- [#1431](https://github.com/bigcommerce/catalyst/pull/1431) [`3a3370e`](https://github.com/bigcommerce/catalyst/commit/3a3370e2323a82dd753cf22042b9cd9130c3a7a0) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adds a typeguard to narrow Errors thrown by `execSync` to be of the type `ExecException`

- [#1432](https://github.com/bigcommerce/catalyst/pull/1432) [`5a2a86e`](https://github.com/bigcommerce/catalyst/commit/5a2a86ecbe8ab831c54b60d2f723274cabc00d98) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adds a function to check if a user is set up with SSH authentication for GitHub

## 0.12.0

### Minor Changes

- [#1365](https://github.com/bigcommerce/catalyst/pull/1365) [`896b4d3`](https://github.com/bigcommerce/catalyst/commit/896b4d359cea39536f41c3fa3427fb6bf429d196) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Changes the default behavior of the `create-catalyst` CLI such that it no longer writes the access token created by the OAuth device flow to the created project's `.env.local` file

- [#1366](https://github.com/bigcommerce/catalyst/pull/1366) [`6d7c508`](https://github.com/bigcommerce/catalyst/commit/6d7c508b453d9e2cbe073b9ab7a7844220c2d22c) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Renames leftover `NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET` environment variables - continuation of bigcommerce/catalyst#1317

## 0.11.0

### Minor Changes

- [#1267](https://github.com/bigcommerce/catalyst/pull/1267) [`d442efc`](https://github.com/bigcommerce/catalyst/commit/d442efcbdbf73f3d6f2e57ddc18049fffc727deb) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Added initial Makeswift integration source folder, which allows developers to create new Catalyst storefronts that are integrated with Makeswift out of the box by running:

  ```sh
  pnpm create @bigcommerce/catalyst@latest --integration=makeswift
  ```

- [#1266](https://github.com/bigcommerce/catalyst/pull/1266) [`6fa0d48`](https://github.com/bigcommerce/catalyst/commit/6fa0d4874e5f7c05cc43019efe8ca4838b504ca1) Thanks [@matthewvolk](https://github.com/matthewvolk)! - remove already completed todo comment

## 0.10.0

### Minor Changes

- [#1192](https://github.com/bigcommerce/catalyst/pull/1192) [`d7d5a96`](https://github.com/bigcommerce/catalyst/commit/d7d5a961498053182a2d075ceb01f45c06f9cbec) Thanks [@matthewvolk](https://github.com/matthewvolk)! - add `integration` command to help with developing native Catalyst integrations

- [#1193](https://github.com/bigcommerce/catalyst/pull/1193) [`aa72351`](https://github.com/bigcommerce/catalyst/commit/aa72351dc37094518e29849fc590dd10044fa955) Thanks [@matthewvolk](https://github.com/matthewvolk)! - add `--integration` option to `create-catalyst` to apply an integration to your newly created storefront

- [#1242](https://github.com/bigcommerce/catalyst/pull/1242) [`733535a`](https://github.com/bigcommerce/catalyst/commit/733535ae4c12b93972b26471b1022cdfd925ed96) Thanks [@matthewvolk](https://github.com/matthewvolk)! - fix: define a single source of truth for integrations manifest file

### Patch Changes

- [#1240](https://github.com/bigcommerce/catalyst/pull/1240) [`dc2cc0d`](https://github.com/bigcommerce/catalyst/commit/dc2cc0d92ce81ae84d61881b2e933e3693f73151) Thanks [@matthewvolk](https://github.com/matthewvolk)! - refactor: parse env using `dotenv` package

## 0.9.0

### Minor Changes

- [#1083](https://github.com/bigcommerce/catalyst/pull/1083) [`bd6be02`](https://github.com/bigcommerce/catalyst/commit/bd6be02d3d3547be6c014c581e1937278ed20d0a) Thanks [@bookernath](https://github.com/bookernath)! - Generate multi-channel GraphQL Storefront API tokens on catalyst provisioning

## 0.8.0

### Minor Changes

- [#936](https://github.com/bigcommerce/catalyst/pull/936) [`8416cd0`](https://github.com/bigcommerce/catalyst/commit/8416cd068c541c9e298ca31422ba5954a59dc868) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Adds more helpful error messaging when using older versions of Node (<12) with the CLI

### Patch Changes

- [#935](https://github.com/bigcommerce/catalyst/pull/935) [`9e9c0e9`](https://github.com/bigcommerce/catalyst/commit/9e9c0e93d707edd160d5cfd7156ab26e45a4847a) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Move CLI command configuration closer to command action handlers

## 0.7.0

### Minor Changes

- [#921](https://github.com/bigcommerce/catalyst/pull/921) [`e093e7c`](https://github.com/bigcommerce/catalyst/commit/e093e7c6db06920718fa76591a7a776f3c575ae4) Thanks [@matthewvolk](https://github.com/matthewvolk)! - Removes unnecessary lint task from create command

## 0.6.0

### Minor Changes

- [#782](https://github.com/bigcommerce/catalyst/pull/782) [`32f9d7c`](https://github.com/bigcommerce/catalyst/commit/32f9d7cad0529591d771106efe3e9cace48e50db) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds the `.vscode/settings.json` file pointing to the correct typescript sdk for gql-tada support.

- [#806](https://github.com/bigcommerce/catalyst/pull/806) [`5655f81`](https://github.com/bigcommerce/catalyst/commit/5655f81f93041e6b1253d0c67ce50f70f99828bf) Thanks [@chanceaclark](https://github.com/chanceaclark)! - Adds an option to include the functional test suite as part of the create command. Defaults to false.

- [#876](https://github.com/bigcommerce/catalyst/pull/876) [`56735be`](https://github.com/bigcommerce/catalyst/commit/56735be7bef1f528642e333b20400268613dace6) Thanks [@matthewvolk](https://github.com/matthewvolk)! - The `create-catalyst` CLI will now create channel menus for new Catalyst channels

### Patch Changes

- [#839](https://github.com/bigcommerce/catalyst/pull/839) [`0e5e513`](https://github.com/bigcommerce/catalyst/commit/0e5e5139ced4410e0930e36b7eafa5841e2301c5) Thanks [@jorgemoya](https://github.com/jorgemoya)! - Remove cloning logic for components.

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
