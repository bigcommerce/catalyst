# Getting Started with the CLI
**Guide**

> [!NOTE]
> **Before you start**
> If you are new to React or Next.js, you may want to start with [learn React](https://react.dev/learn) and [learn Next.js](https://nextjs.org/learn-pages-router/basics/create-nextjs-app), then work with the [Next.js docs](https://nextjs.org/docs).

## Prerequisites

* Node.js 18+, using `npm` or `pnpm`
* Login access to a BigCommerce store or sandbox. You can [create a trial store](https://bigcommerce.com/start-your-trial/) or [spin up a sandbox](https://start.bigcommerce.com/developer-sandbox/).
* [User permissions to create new store-level API accounts](https://support.bigcommerce.com/s/article/User-Permissions?language=en_US#highrisk) on the subject store, or help from someone who has permissions.

## Create a new Catalyst project

Create a new Catalyst project by running the Catalyst CLI. This will create a new directory that contains your Catalyst project.

```
npm create catalyst-storefront@latest
```

You will be asked the following prompts:

```
What is the name of your project?
Would you like to connect to a BigCommerce store?
Would you like to create a new channel?
```

During the connection step, you will be asked to sign in to your store using a browser and enter a code provided by the CLI to authenticate your Catalyst project and generate the necessary credentials.

We recommend creating a new channel on your store for your new Catalyst storefront. More information about channels can be found in BigCommerce's [channels](https://developer.bigcommerce.com/docs/storefront/headless/channels) documentation.

## Run Catalyst

Once you've completed the setup process, enter the new directory created by the CLI and run the following command to run your Catalyst storefront locally.

```
npm run dev
```

(`pnpm` is also supported. `yarn` is _not_ currently supported.)

Your Catalyst storefront is now connected to your BigCommerce store, running on `http://localhost:3000`!

## Configure your Catalyst project

If you want to change which BigCommerce store your Catalyst project is linked to, run the following command 
from within the directory containing your Catalyst project to go through the setup process again.

```
npx create-catalyst-storefront@latest init
```
If you prefer to have more control over how Catalyst is configured, you can also manually set Catalyst's [environment variables](/docs/environment-variables.md).
