# @bigcommerce/create-catalyst

Create a new Catalyst project, and optionally connect the project to a BigCommerce store. Add `--help` to the end of any command to learn about available subcommands and options.

## Usage

> [!WARNING]
> With yarn berry, you might run into a dependency issue with `stripAnsi`. You can circumvent this issue by setting the [nodeLinker](https://yarnpkg.com/configuration/yarnrc#nodeLinker) to either `pnpm` or `node-modules` while the dependency issue is resolved.

### Create a new Catalyst project

```sh
npm create @bigcommerce/catalyst@latest
```

```sh
pnpm create @bigcommerce/catalyst@latest
```

```sh
yarn create @bigcommerce/catalyst@latest
```

### Connect an existing Catalyst project to a BigCommerce store

```sh
npm create @bigcommerce/catalyst@latest init
```

```sh
pnpm create @bigcommerce/catalyst@latest init
```

```sh
yarn create @bigcommerce/catalyst@latest init
```
