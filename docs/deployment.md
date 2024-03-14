**Guide**
# Deploying a Catalyst storefront

> [!NOTE]
> **Before you start**
> This guide assumes you have created a Catalyst storefront using [the CLI](/docs/cli.md) or the [Advanced configuration guide](/docs/environment-variables.md). Your project directory should contain only a Next.js application rather than the monorepo in the [Catalyst GitHub repository](https://github.com/bigcommerce/catalyst). If you want to develop using the monorepo, you must modify these instructions. For more information, see [Monorepo](/docs/monorepo.md).

## Deploy to Vercel from vercel.com

You can deploy your Catalyst storefront to Vercel with just a source control repository and a few environment variables.

To deploy to Vercel using vercel.com, [sign up or sign in to your Vercel account](https://vercel.com/signup) and select **Add New... > Project** from the top right of the Overview page.

![Vercel overview page](https://storage.googleapis.com/bigcommerce-production-dev-center/images/catalyst/deployment-vercel-overview.jpg)

On the **Let's build something new** page, point Vercel to a GitHub, GitLab, or Bitbucket source repo that contains your Catalyst storefront's code. 

![Vercel project page](https://storage.googleapis.com/bigcommerce-production-dev-center/images/catalyst/deployment-vercel-project-page.jpg)

Add the required [environment variables](/docs/environment-variables.md). In addition to the required variables, add a value for `TURBO_REMOTE_CACHE_SIGNATURE_KEY` for optimal build performance on Vercel. After you add the environment variables, click **Deploy**.

![Vercel environment variables](https://storage.googleapis.com/bigcommerce-production-dev-center/images/catalyst/deployment-vercel-environment-variables.jpg)

To learn more about deploying to Vercel, consult the [Vercel deployments overview](https://vercel.com/docs/deployments/overview).

## Deploy to Vercel using the Vercel CLI

To deploy using the [Vercel CLI](https://vercel.com/docs/cli), install it by running `npm i -g vercel` or `pnpm i -g vercel`.

Next, add the required [environment variables](/docs/environment-variables.md) to your `.env.local` file. For optimal build performance on Vercel, add a value for `TURBO_REMOTE_CACHE_SIGNATURE_KEY` in addition to the required variables.

Next, open a terminal session and `cd` into the local directory that contains your Catalyst storefront's code. Install or update the project dependencies with `npm i` or `pnpm i`, then run `npm run dev` or `pnpm run dev` and make sure the storefront functions correctly.

When everything looks good, run `vercel` to create a preview deployment or `vercel --prod` to create a production deployment. If this is your first time using the Vercel CLI from this project, the CLI will take you through a few prompts to connect an existing Vercel project or create a new one.

If you are creating a new Vercel project using the CLI, you need to add the environment variables; your first build may fail if no environment variables are populated. You can add the variables one at a time using [vercel env add](https://vercel.com/docs/cli/env), or sign in to [vercel.com](https://vercel.com) and paste the contents of your `.env.local` file into the env var settings for your Vercel project.

For more information on the Vercel CLI, consult the [Vercel CLI Documentation](https://vercel.com/docs/cli).
