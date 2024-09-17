**Developers**

# Getting started with Catalyst

How you get started with Catalyst depends on your specific goals. You might be:

1. A **Storefront Developer**, looking to create a custom storefront using Catalyst as your foundation.
2. An **Integration Developer**, aiming to build add-ons or integrations that can be optionally included in Catalyst storefronts.
3. A **Contributor**, interested in enhancing the Catalyst project by submitting pull requests for new features, bug fixes, or other improvements.

Regardless of your role, the [main GitHub repository for Catalyst](https://github.com/bigcommerce/catalyst) is the ideal starting point.

The initial setup steps are the same for all developers, and this guide will later provide tailored instructions based on your specific path.

## Overview

The [main GitHub repository for Catalyst](https://github.com/bigcommerce/catalyst) is a [monorepo](https://en.wikipedia.org/wiki/Monorepo) with multiple codebases, including but not limited to the following:

- [The core Next.js reference storefront application, in `/core`](https://github.com/bigcommerce/catalyst/tree/main/core)
- [Packages published to NPM, in `/packages`](https://github.com/bigcommerce/catalyst/tree/main/packages)
- [Product documentation, in `/docs`](https://github.com/bigcommerce/catalyst/tree/main/docs)

It's important to note that we use several tools throughout the Catalyst monorepo, such as [Turborepo](https://turbo.build/repo/docs) and [pnpm Workspaces](https://pnpm.io/workspaces); you'll notice references to these tools as you spend more time in the repository, but most developers likely won't need to change any files, code, or configuration related to these tools in their normal Catalyst workflows.

## Prerequisites

1. **Node.js version `20.x`:** Catalyst currently supports Node.js version `20.x` ([click here to download Node.js](https://nodejs.org/en/download/package-manager))
2. **Corepack-enabled `pnpm`:** Node.js version `20.x` ships with Corepack by default; you should be able to run `corepack enable` from your terminal to meet this prerequisite (more information on the [official Node.js Corepack documentation](https://nodejs.org/docs/latest-v20.x/api/corepack.html))
3. **Git version `2.35.x` or later:** ([Click here to download Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git))
4. **A BigCommerce store or sandbox:** You can [create a trial store](https://bigcommerce.com/start-your-trial/) or [spin up a developer sandbox](https://start.bigcommerce.com/developer-sandbox/) to meet this prerequisite. If you already have a BigCommerce store, that will work fine too.
5. **Permission to create API accounts on your store:** In order to allow Catalyst to authenticate with your BigCommerce store, you'll need to make sure that your user account on the subject store has been granted the `Create store-level API Accounts` permission detailed in our [documentation on High-Risk Permissions](https://support.bigcommerce.com/s/article/User-Permissions#highrisk). If you are the assigned store owner of the store, you have these permissions implicitly.
6. **A GitHub account:** You can sign up for a free GitHub account on the [official GitHub signup page](https://github.com/join).

## Getting started

### 1. Fork and clone the Catalyst monorepo

We'll begin by forking the Catalyst monorepo.

[You can click here to create a fork](https://github.com/bigcommerce/catalyst/fork) or, navigate to [https://github.com/bigcommerce/catalyst](https://github.com/bigcommerce/catalyst) and click "Fork" at the top of the page.

GitHub will prompt you to choose a name for your fork; for the purposes of this guide, we'll refer to name of the fork as `<YOUR_FORK_NAME>`. You should replace `<YOUR_FORK_NAME>` in all of the commands below with your actual fork name.

Back in your terminal, clone your fork:

```shell copy
git clone git@github.com:<YOUR_GITHUB_USERNAME>/<YOUR_FORK_NAME>.git
```

Now, change directories into the cloned fork:

```shell copy
cd <YOUR_FORK_NAME>
```

> [!NOTE]
> Unless otherwise specified, all of the commands that you run in your terminal from this point on should be run from the root of the monorepo repository you just cloned.

### 2. Add a remote pointing to the upstream Catalyst repository

After forking the Catalyst repository, you'll want to set up a connection to the original Catalyst repository so you can easily pull in updates and stay up-to-date with the latest changes. This involves adding the original Catalyst repository as a remote, often named `upstream`.

This will allow you to fetch changes from the main Catalyst project and merge them into your fork as needed.

```shell copy
git remote add upstream git@github.com:bigcommerce/catalyst.git
```

To confirm, run the following command in your terminal:

```shell copy
git remote -v
```

You should see output similar to:

```shell
origin          git@github.com:<YOUR_GITHUB_USERNAME>/<YOUR_FORK_NAME>.git (fetch)
origin          git@github.com:<YOUR_GITHUB_USERNAME>/<YOUR_FORK_NAME>.git (push)
upstream        git@github.com:bigcommerce/catalyst.git (fetch)
upstream        git@github.com:bigcommerce/catalyst.git (push)
```

### 3. Enable Corepack

Enable Corepack so that you can use `pnpm` as your Node.js package manager with Catalyst. When working in the monorepo, you must use `pnpm`, **you cannot use `npm` or `yarn`**.

```shell copy
corepack enable pnpm
```

You can verify that the installation worked by running:

```shell copy
pnpm --version
```

> [!TIP]
> You might see a confirmation prompt similar to `! Corepack is about to download https://registry.npmjs.org/pnpm/-/pnpm-X.X.X.tgz` and `? Do you want to continue? [Y/n]`. You should type `Y` to continue.

If you see a version number printed to your console, you have successfully completed this step.

### 4. Install Catalyst dependencies

From the root of the monorepo, run the command below to install dependencies.

```shell copy
pnpm install
```

### 5. Set up environment variables

```shell copy
pnpm create @bigcommerce/catalyst@latest init
```

The CLI command above will prompt you to log into one of your BigCommerce stores, then create a new/use an existing Catalyst storefront Channel in your Control Panel’s Channel Manager section. It will then create an `.env.local` file with the required environment variables to run the Catalyst monorepository.

### 6. (Optional) Copy VSCode settings

If you use VS Code, use the following command to configure VSCode with the project-specific settings the Catalyst team has created:

```shell copy
cp .vscode/settings.example.json .vscode/settings.json
```

### 7. Run the development server!

Finally, you can run the following command from the monorepo root to run the development server:

```shell copy
pnpm run dev
```

The following table lists localhost URLs with the default ports. When a port is unavailable, Catalyst uses the next available port. For example, if `3000` is in use, `core` will run on `3001`.

| Process             | URL with port           |
| :------------------ | :---------------------- |
| Catalyst storefront | `http://localhost:3000` |

### 8. Choose your path

Now that you can run Catalyst locally, your next steps are dependent on your role (described at the top of this page). Please proceed by clicking a role below:

- **Storefront Developers:** [Click here](./monorepo.md#storefront-developers)
- **Integration Developers:** [Click here](./monorepo.md#integration-developers)
- **Contributors:** [Click here](./monorepo.md#contributors)

## Storefront Developers

As a storefront developer, your next steps will involve customizing and building Catalyst on top of the `main` branch in your fork of the Catalyst repository. This section will guide you through setting up your storefront development environment, making your first customizations to your storefront, and pulling in updates from the upstream Catalyst repository.

### Setting up your storefront development environment

You will be making your customizations directly on the `main` branch of your fork. This means your `main` will contain both upstream updates and your own changes. This approach is straightforward but requires careful merging when pulling in updates from the upstream.

### Making your first code customization

For example purposes, let's make a small code change to simulate what a real storefront development workflow might look like when working in Catalyst.

First, open the following file in your text editor: `core/package.json`

Next, find the `"name"` property inside the JSON object towards the top of the file. Replace its value `"@bigcommerce/catalyst-core"` with the name of your storefront project:

```json
{
  "name": "my-store-name"
  // ...
}
```

Save the file so that we can commit those changes.

From the root of the monorepo, add your change by running:

```shell copy
git add -p
```

Commit your change by running:

```shell copy
git commit -m "updated project name"
```

Finally, push your changes to your remote by running:

```shell copy
git push origin main
```

> [!NOTE]
> In a real development workflow, you might have set up continuous deployment to run whenever code is pushed to the `main` branch of your remote fork; if that was the case, then at this point your changes would likely be automatically deployed to production.

Congratulations! You've just written, committed, and pushed your very first customization to your Catalyst storefront project.

### Pulling in updates from the upstream

Now that the `main` branch on your fork (also referred to as `origin/main`) has diverged from the `main` branch on the upstream repository (also referred to as `upstream/main`), we should talk about how we recommend keeping your Catalyst project up to date.

First, let's check to see if any updates have been pushed to the upstream Catalyst repository recently. Run the following command to fetch the latest upstream changes:

```shell copy
git fetch upstream main
```

If you see output similar to what's below, your Catalyst fork is up to date with the upstream Catalyst repository. You can continue building your storefront.

```shell
From github.com:bigcommerce/catalyst
 * branch            main       -> FETCH_HEAD
```

On the other hand, if you see output closer to what's below, your Catalyst fork is out of date, and it might be a good idea to update it.

```shell
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
remote: Compressing objects: 100% (1/1), done.
remote: Total 3 (delta 2), reused 3 (delta 2), pack-reused 0 (from 0)
Unpacking objects: 100% (3/3), 511 bytes | 255.00 KiB/s, done.
From github.com:bigcommerce/catalyst
 * branch            main       -> FETCH_HEAD
   abcd123..efgh456  main       -> upstream/main
```

If you would like to update your Catalyst fork, simply merge the upstream changes into your `main` branch:

```shell copy
git checkout main
git merge upstream/main
```

You'll be prompted to enter a commit message. We recommend a commit message similar to `"Pull Catalyst upstream updates MM/DD/YYYY"`. Save your message and run the previous command to check for updates:

```shell copy
git fetch upstream main
```

Your local Catalyst project is now up to date!

> [!IMPORTANT]
> Resolving all merge conflicts after pulling in updates should not be your only indicator that the updates did not introduce regressions when coupled with your customizations. We recommend multiple forms of testing and QA before deploying to production in general, but especially after pulling in new updates from the Catalyst upstream repository.

### Consuming Catalyst integrations

There are a number of integration branches containing sample code for a wide variety of use cases in the Catalyst upstream repository:

[https://github.com/bigcommerce/catalyst/branches/all?query=integrations%2F](https://github.com/bigcommerce/catalyst/branches/all?query=integrations%2F)

Generally speaking, Catalyst integrations are just branches available in the upstream GitHub repository that can be checked out locally; so in order to evaluate an integration locally, you can use the standard Git workflow to create a new local branch from a remote upstream branch:

```shell copy
git fetch upstream <INTEGRATION_BRANCH>
git checkout -b <INTEGRATION_BRANCH> upstream/<INTEGRATION_BRANCH>
```

You can explore and run the code locally on this branch. If you like what you see, you can copy & paste the code that you find most beneficial to your custom storefront build back into your `main` branch.

### Next steps

Now that you feel confident customizing and updating your Catalyst storefront, we recommend reading our documentation on styling your storefront, fetching data from your storefront, creating components for your storefront, and deploying your storefront.

## Integration Developers

From the entire Catalyst team, we're excited to build alongside you! Being an integration developer means making it easier and more accessible for merchants to adopt your technology into their composable commerce stack.

Catalyst integrations vary in size and complexity; some Catalyst integrations may communicate with third-party API's and work best when paired with a related app from the [BigCommerce App Marketplace](https://bigcommerce.com/apps), while other Catalyst integrations may be as simple as installing a package from NPM.

No matter the size of your integration, one thing that all Catalyst integrations have in common is that they contain reference code pushed to a branch on the Catalyst upstream repository. This makes it easy to browse every single Catalyst integration in one location:

[https://github.com/bigcommerce/catalyst/branches/all?query=integrations%2F](https://github.com/bigcommerce/catalyst/branches/all?query=integrations%2F)

<!-- @todo clean up all the branches on catalyst upstream. people should work from their forks so that branches are easier to skim in upstream -->

This section will guide you through setting up your integration development environment, building a minimal reference implementation of your technology into Catalyst, and finally how to pull in updates from the upstream Catalyst repository to keep your integration up to date.

By the end of this section, you'll be on your way to having your integration listed in the link above.

### Setting up your integration development environment

Since you'll ultimately be contributing code back up to the Catalyst upstream GitHub repository, it makes the most sense for you to create a new branch off of `upstream/main` in your local Catalyst fork:

```shell copy
git fetch upstream main
git checkout -b integrations/<INTEGRATION_NAME> upstream/main
```

Now, you can begin to write the code required to make your integration work!

### Building your integration

There are a handful of lessons we have learned from building integrations into Catalyst ourselves; we wanted to offer those lessons as tips to follow while building your own integration. You should highly consider incorporating these tips into your own workflow, as we have found it has saved us time and headache.

1. Keep your integration code as maintainable as possible. You'll notice that the [`integrations/makeswift` branch](https://github.com/bigcommerce/catalyst/compare/main...integrations/makeswift) has only a single commit, and about 20 changed files. This means that merge conflicts caused rebasing on top of the latest `upstream/main` to update your integration are easier to deal with.
2. Explicitly call out when your integration makes use of newly introduced environment variables. You'll notice that the [`integrations/makeswift` branch](https://github.com/bigcommerce/catalyst/compare/main...integrations/makeswift) adds a new environment variable called `MAKESWIFT_SITE_API_KEY`; by explicitly listing newly introduced environment variables in a version-controlled file like `.env.example`, it makes it obvious to the consumers of your integration when they need to add new environment variables to make your integration work.

### Open a PR to add your integration to upstream

Now that your branch is ready for public use, please start by opening a new issue in the Catalyst upstream GitHub repository. In your issue, request the creation of an `integrations/<INTEGRATION_NAME>` branch. Once the branch is created, you can target it with your pull request to contribute your integration code back upstream.

### Keeping your integration up to date

Keeping your integration up to date is as simple as rebasing your integration branch on top of the latest changes introduced to `upstream/main`, and then opening a PR from your origin remote fork integration branch into the integration branch with the same name on the upstream remote repository.

```shell copy
git checkout integrations/<INTEGRATION_NAME>
git fetch upstream main
git pull --rebase upstream main
git push --force-with-lease origin integrations/<INTEGRATION_NAME>
```

## Contributors

We're so happy you're interested in contributing to what we believe is the fastest, most fully-featured storefront in the world. Have a look at our [CONTRIBUTING.md](https://github.com/bigcommerce/catalyst/blob/main/CONTRIBUTING.md) over in the Catalyst GitHub repository to get started!

## Additional information

### Testing

We use Playwright to test our components and verify workflows on the UI. To learn more, see the [official website documentation](https://playwright.dev/docs/intro).

To run the UI tests locally:

1. Set up the environment variable required to point the tests to either a hosted or local Catalyst instance.

```shell copy
PLAYWRIGHT_TEST_BASE_URL='https://catalyst-demo.site' || 'http://localhost:3000'
# Optional: Some tests will fail without these credentials.
# The environment variables allow automatic creation of customer accounts. These will cleanup themselves after the tests are done.
BIGCOMMERCE_ACCESS_TOKEN="<access-token>"
BIGCOMMERCE_STORE_HASH="<store-hash>"
```

2. Navigate to the test directory:

```shell copy
cd core/
```

3. Run all UI tests in Chromium:

```shell copy
pnpm exec playwright test tests/ui/ --project=tests-chromium
```

4. Run a specific test in Chromium:

```shell copy
pnpm exec playwright tests/visual-regression/components/badge.spec.ts --project=tests-chromium
```
