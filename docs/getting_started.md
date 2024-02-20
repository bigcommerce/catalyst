## Getting Started

> [!NOTE]
> If you are new to React or Next.js, you may want to start with [learn React](https://react.dev/learn), [learn Next.js](https://nextjs.org/learn-pages-router/basics/create-nextjs-app) and [Next.js documentation](https://nextjs.org/docs) first.

### Required
* Node.js 18+
* `npm` (or `pnpm`/`yarn`)
* Login access to a BigCommerce store. You can create a trial store [here](https://www.bigcommerce.com/start-your-trial/) if needed.
    * You will need the user permission to create new API tokens on the store, or to ask for help from someone who does

### Create a new Catalyst project

Create a new Catalyst project by running the Calalyst CLI. This will create a new directory that contains your Catalyst project.

```
npm create catalyst-storefront@latest
```

You will be asked the following prompts:

```
What is the name of your project?
Would you like to connect to a BigCommerce store?
Would you like to create a new channel?
```

During the connection step, you'll be asked to login to your store using a browser and enter a code provided by the CLI.

We recommend creating a new channel on your store for your new Catalyst storefront. More information about channels can be found in BigCommerce's [channels](https://developer.bigcommerce.com/docs/integrations/channels) documentation.

### Running Catalyst

Once you've completed the setup process, enter the new directory created by the CLI and run the following command to run your Catalyst storefront locally (`pnpm`/`yarn` are also supported).

```
npm run dev
```

Your Catalyst storefront is now connected to your BigCommerce store, running on `http://localhost:3000`!

### Configuring your Catalyst project

If you want to change which BigCommerce store your Catalyst project is linked to, run the following command 
from within the directory containing your Catalyst project to go through the setup process again.


```
npx create-catalyst-storefront@latest init
```

If you prefer to have more control over how Catalyst is configured, you can also manually set Catalyst's [environment variables]().