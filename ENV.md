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

**Make sure you are using Node v20.x.x**

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
pnpm create @bigcommerce/catalyst@latest
```

## Authentication

Follow the authentication flow and log in to BigCommerce.  
Until we connect to the WF Store, use the test store. Contact the Software Dev team for access.

- **Account:** Leighton
- **Store:** Leighton Test Store
- **Channel:** `wf-catalyst-canary-channel`

## Configuration

This process will create an `.env.local` file.

Next build the monprepo environment. This builds the graphql client, schema and some dist files used in the application

The `.env.local` should be supplemented with the following variables

NEXT_PUBLIC_CONTENTFUL_SPACE_ID
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
NEXT_PUBLIC_GTM_ID
AVIOS_NPM_AUTH_TOKEN

Contact a member of the team to get these variables

Once you have AVIOS_NPM_AUTH_TOKEN set ypou can run to create your .npmrc giving you access to the

```sh
npm run generate:npmrc
```

Then run

```sh
pnpm run build
```

Navigate to the `core` directory and start the local SST development environment:

```sh
cd core
```

Then on first development server run add the `--set-secrets` flag

```sh
npm run sst:dev --set-secrets
```

This will read the .env.local file created earlier and with the SST Secrets feature <https://sst.dev/docs/component/secret> to prevent environment variables being passed in via deploy commands.

Subsequent server starts you can omit the `--set-secrets` flag.

The SST console will run in the terminal and allows local development while using cloud features of your app.

## Deploy Ephemeral environment to AWS

```sh
pnpm run sst:deploy
```

This will create an ephemeral environment based on your branch name.
