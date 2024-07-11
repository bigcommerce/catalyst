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

### Develop a native integration for a new Catalyst project

If you are interested in developing a native integration for Catalyst, you can use the `integrate` command that ships with the CLI.

First, fork the entire `bigcommerce/catalyst` repository, clone it locally, and [follow the steps to get started with local monorepo development](https://www.catalyst.dev/docs/monorepo). Be sure to add the original `bigcommerce/catalyst` repository as a remote (often called `upstream`) so that you can pull in latest updates pushed to `bigcommerce/catalyst:main`. 

<!-- @todo remove this note, just for development -->
If you are a BigCommerce employee with push access to `bigcommerce/catalyst`, you don't need to fork.

<!-- @todo this step will be simplified to just use `pnpm create @bigcommerce/catalyst@latest integrate` in production -->
Next, run `git switch wip/integrations-cli` and build the CLI source code locally so that you can run the `integrate` command. Run this command from the root of your monorepo:

```bash
pnpm install &&
pnpm -F @bigcommerce/create-catalyst build
```

Next, create a branch off of `main` and name it whatever you'd like. This branch is where you'll be building your integration into Catalyst.

```bash
git checkout main && 
git checkout -b my-integration
```

> [!IMPORTANT]
>
> #### Things to consider when building integrations:
>
> - In order to ensure your integration applies cleanly to new Catalyst projects, your integration should be 100% contained within the `core` folder of the monorepo. With the exception of installing packages inside of `core` (which in turn modifies the root `pnpm-lock.yaml` file), none of your integration code should live outside of the `core` folder.
> - If your integration requires environment variables to work, be sure to add those environment variables to `core/.env.example`. This allows the `integrate` CLI to track which environment variables are required for the integration to work.

When you've finished building your integration, commit your changes to the branch, and then run the following command:

<!-- @todo this step will be simplified to just use `pnpm create @bigcommerce/catalyst@latest integrate` in production -->
```bash
git checkout wip/integrations-cli &&
pnpm install &&
pnpm -F @bigcommerce/create-catalyst build &&
node ./packages/create-catalyst/dist/index.js integrate --integration-name="My Integration" --source=my-integration
```

The command above will create a new folder in your working tree called `integrations/<integration-name-normalized>/` with two files: `integration.patch` and `manifest.json`. With this folder still untracked in your working tree, create a new branch off of main:

```bash
git checkout main &&
git checkout -b integration/name
```

Once that branch is created, commit your changes, push it to your fork, and open a pull request from your remote branch into `bigcommerce/catalyst:main`. Once your branch is merged into main, the CLI will register your new integration for users to choose from when creating a new Catalyst project.
