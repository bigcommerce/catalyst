# Deploying a Catalyst storefront
**Guide**

> [!NOTE]
> **Before you start**
> The following overview assumes you have created a Catalyst storefront, either [using the CLI]() or following the [Advanced configuration guide](). Your project directory should contain only a single Next.js application, rather than the monorepo present in the [Catalyst GitHub repository](https://github.com/bigcommerce/catalyst). If you want to develop using the monorepo, you'll need to modify these instructions. For more information, see [Monorepo](/docs/monorepo.md).

## Deploy to Vercel from vercel.com

You can deploy your Catalyst storefront to Vercel with just a source control repository and a few environment variables.

To deploy to Vercel using vercel.com, [sign up or sign in to your Vercel account]() and select **Add New... > Project** from the top right of the Overview page.

[screenshot]()

On the **Add New Project**(>> verify name) page, point Vercel to a GitHub, GitLab, or Bitbucket source repo that contains your Catalyst storefront's code, then add the requested [environment variables](/docs/environment-variables.md). For optimal build performance on Vercel, add a value for `TURBO_REMOTE_CACHE_SIGNATURE_KEY` in addition to the required variables.

[screenshot]()

After you add the environment variables, click **Deploy**.

[screenshot]()

To learn more about deploying to Vercel, consult the [Vercel deployments overview](https://vercel.com/docs/deployments/overview).

## Deploy to Vercel using the Vercel CLI

To deploy using the [Vercel CLI](https://vercel.com/docs/cli), install the Vercel CLI by running `npm i -g vercel` or `pnpm i -g vercel`.

Next, add the required [environment variables](/docs/environment-variables.md) to [.env.local](/.env.example). For optimal build performance on Vercel, add a value for `TURBO_REMOTE_CACHE_SIGNATURE_KEY` in addition to the required variables.

Next, open a terminal session and `cd` into the local directory that contains your Catalyst storefront's code. Install or update the project dependencies with `npm i` or `pnpm i`, then run `npm run dev` or `pnpm run dev` and make sure the storefront functions correctly.

When everything looks good, run `vercel` to create a preview deployment or `vercel --prod` to create a production deployment. If this is your first time using the Vercel CLI from this project, the CLI will take you through a few prompts to connect an existing Vercel project or create a new one.

If you are creating a new Vercel project using the CLI, you need to add the environment variables to the new Vercel project; your first couple builds will likely fail as you move through the process. You can add the variables one at a time using [vercel env add](https://vercel.com/docs/cli/env), or sign in to [vercel.com](https://vercel.com) and paste the contents of your `.env.local` file into the env var settings for your Vercel project.

For more information on the Vercel CLI, consult the [Vercel CLI Documentation](https://vercel.com/docs/cli).
