**Guide**
# Deploying a Catalyst storefront

## Deploy to Vercel from vercel.com

You can deploy your Catalyst storefront to Vercel with just a source control repository and a few environment variables.

To deploy to Vercel using vercel.com, [sign up or sign in to your Vercel account](https://vercel.com/signup) and select **Add New... > Project** from the top right of the Overview page.

![Vercel overview page](https://storage.googleapis.com/bigcommerce-production-dev-center/images/catalyst/deployment-vercel-overview.jpg)

On the **Let's build something new** page, point Vercel to a GitHub, GitLab, or Bitbucket source repo that contains your Catalyst storefront's code. 

![Vercel project page](https://storage.googleapis.com/bigcommerce-production-dev-center/images/catalyst/deployment-vercel-project-page.jpg)

Since we are deploying from a monorepo, we need to adjust some of the default Vercel deployment configuration. For "Framework Preset" you'll want to select "Next.js", and for "Root Directory", click "Edit" and select the `core/` folder. You may leave the "Build and Output Settings" section as-is.

![Vercel Monorepo configuration](https://storage.googleapis.com/bigcommerce-developers/images/deployment-vercel-monorepo-configuration.png)

Add the required [environment variables](/docs/environment-variables.md). In addition to the required variables, add a value for `TURBO_REMOTE_CACHE_SIGNATURE_KEY` for optimal build performance on Vercel. After you add the environment variables, click **Deploy**.

![Vercel environment variables](https://storage.googleapis.com/bigcommerce-production-dev-center/images/catalyst/deployment-vercel-environment-variables.jpg)

To learn more about deploying to Vercel, consult the [Vercel deployments overview](https://vercel.com/docs/deployments/overview).

## Deploy to Vercel using the Vercel CLI

To deploy using the [Vercel CLI](https://vercel.com/docs/cli), install it by running `npm i -g vercel` or `pnpm i -g vercel`.

Next, add the required [environment variables](/docs/environment-variables.md) to your `.env.local` file. For optimal build performance on Vercel, add a value for `TURBO_REMOTE_CACHE_SIGNATURE_KEY` in addition to the required variables.

Next, open a terminal session and `cd` into the local directory that contains your Catalyst storefront's code. Install or update the project dependencies with `npm i` or `pnpm i`, then run `npm run dev` or `pnpm run dev` and make sure the storefront functions correctly.

When everything looks good, run `vercel` to create a preview deployment or `vercel --prod` to create a production deployment. If this is your first time using the Vercel CLI from this project, the CLI will take you through a few prompts to connect an existing Vercel project or create a new one, and you can use the answers below to help work through those prompts:

```
Vercel CLI 37.8.0
? Set up and deploy “~/path/to/my-catalyst-app”? yes
? Which scope do you want to deploy to? your-vercel-workspace
? Link to existing project? no
? What’s your project’s name? my-catalyst-app
? In which directory is your code located? ./core
Local settings detected in vercel.json:
Auto-detected Project Settings (Next.js):
- Build Command: next build
- Development Command: next dev --port $PORT
- Install Command: `yarn install`, `pnpm install`, `npm install`, or `bun install`
- Output Directory: Next.js default
? Want to modify these settings? no
```

If you are creating a new Vercel project using the CLI, you need to add the environment variables; your first build will fail if no environment variables are populated. You can add the variables one at a time using [vercel env add](https://vercel.com/docs/cli/env), or sign in to [vercel.com](https://vercel.com) and paste the contents of your `.env.local` file into the env var settings for your Vercel project. Once added, navigate back to your Vercel project, click "Deployments" and click "Redeploy" inside the ellipses dropdown menu.

For more information on the Vercel CLI, consult the [Vercel CLI Documentation](https://vercel.com/docs/cli).
