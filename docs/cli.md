**Guide**
# Getting started with the CLI

> [!NOTE]
> **Before you start**
> If you are new to React or Next.js, you may want to start with [learn React](https://react.dev/learn) and [learn Next.js](https://nextjs.org/learn-pages-router/basics/create-nextjs-app), then work with the [Next.js docs](https://nextjs.org/docs).

## Prerequisites

* Node.js 20+, using `npm` or `pnpm`.
* Login access to a BigCommerce store or sandbox. You can [create a trial store](https://bigcommerce.com/start-your-trial/) or [spin up a sandbox](https://start.bigcommerce.com/developer-sandbox/).
* [User permissions to create new store-level API accounts](https://support.bigcommerce.com/s/article/User-Permissions#highrisk) on the subject store or help from someone who has permissions.

<!-- At which step in this guide do we need the store-level API accounts? -->

## Create a new Catalyst project

To create a new Catalyst project, use the Catalyst CLI, which will create a new directory that contains your Catalyst project. You don't need to clone the [Catalyst GitHub repository](https://github.com/bigcommerce/catalyst) monorepo to use the CLI.

When the CLI connects your project to the BigCommerce store you intend to use, you will be asked to sign in to the subject store using the browser and enter a code provided by the CLI. This step registers your Catalyst project and generates the access tokens the storefront needs to use our APIs. For a more in-depth explanation of authentication mechanisms in Catalyst, see [Environment variables](/docs/environment-variables.md) in the Catalyst docs and [Authenticating Customers](https://developer.bigcommerce.com/docs/start/authentication/customer-login) on the BigCommerce Dev Center.

We recommend creating a new channel for the Catalyst storefront. For more about channel configuration, see BigCommerce's [channels docs](https://developer.bigcommerce.com/docs/storefront/headless/channels).

To get started with the CLI, run the following command:

```shell
pnpm create @bigcommerce/catalyst@latest
```

or

```shell
npm create @bigcommerce/catalyst@latest
```

The CLI will take you through the following prompts:

```shell
? What is the name of your project? fast-headless-storefront
? Would you like to connect to a BigCommerce store? Y
  Please visit https://login.bigcommerce.com/device/connect and enter the code: <alphanumstr>

The code will expire in 30 minutes

✔ Device code authorized

? Would you like to create a new channel? y

? What would you like to name the new channel? Fast Headless Storefront

Creating 'fast-headless-storefront' at '/Users/first.last/Documents/projects/fast-headless-storefront'

✔ Catalyst template cloned successfully
✔ Catalyst components cloned successfully

Using pnpm

✔ Dependencies installed successfully

... generate GraphQL types ...

Success! Created 'fast-headless-storefront' at '/Users/first.last/Documents/projects/fast-headless-storefront'
```

## Run Catalyst

To run your Catalyst storefront locally, `cd` into the project directory the CLI created, and run the following command:

```shell
corepack enable pnpm

pnpm run dev
```

Currently, Catalyst supports `npm` and `pnpm`. It does not currently support `yarn`.

The Catalyst storefront will run on `http://localhost:3000`.

## Configure your Catalyst project

If you want to link your Catalyst project to a different BigCommerce store, repeat the setup process. Run the following command from within the directory that contains your Catalyst project:

```shell
npx @bigcommerce/create-catalyst@latest init
```

If you prefer more control over Catalyst's configuration, you can manually set Catalyst's [environment variables](/docs/environment-variables.md). For more information, see [Advanced config](/docs/monorepo.md).
