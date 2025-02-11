# Environment Setup

## AWS SSO Setup

Set up AWS SSO for the following profiles:

- **AdministratorAccess-242201303751**
- **Avios Retail Dev**

Run the following command:

```sh
aws configure sso
```

Follow the instructions here:

<https://leighton.atlassian.net/wiki/spaces/AC/pages/2660761606/AWS+SSO+Configuration>

## Clone the Repository

Clone the repository and navigate into your project folder:

```sh
git clone git@github.com:leighton-digital/wf-catalyst.git your-folder-name
cd your-folder-name
```

## Branching Strategy

Switch to the `develop` branch and create a new feature branch:

```sh
git checkout develop
git checkout -b feature/your-branch-name
```

## Install Dependencies

Enable `pnpm`:

```sh
corepack enable pnpm
```

Install project dependencies:

```sh
pnpm install
```

Initialize Catalyst:

```sh
pnpm create @bigcommerce/catalyst@latest init
```

## Authentication

Follow the authentication flow and log in to BigCommerce.  
Until we connect to the WF Store, use the test store. Contact the Software Dev team for access.

- **Account:** Leighton
- **Store:** Leighton Test Store
- **Channel:** `wf-catalyst-canary-channel`

## Configuration

This process will create an `.env.local` file. Copy it to the `core` directory:

```sh
cp .env.local ./core
```

Navigate to the `core` directory and start the local development server:

```sh
cd core
pnpm run sst:dev
```

This runs a local instance of Catalyst pointing to our test storefront.

## Deploying to AWS

To deploy, ensure that required environment variables are added to `sst.config.ts` under `sst.aws.Nextjs`:

```ts
{
  environment: {
    ENV_VARS: 'HERE';
  }
}
```

Then run:

```sh
pnpm run sst:deploy
```

This will create an ephemeral environment based on your branch name.
