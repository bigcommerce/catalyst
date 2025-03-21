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

### Local Environment

Create a .env.local file in the root of your application

**Contact the Software Delivery Team for your .env.local**

### Continue with .env.local added

Once you have your environment variables setup create your **.npmrc** giving you access to the private repo.

```sh
npm run generate:npmrc
```

Install project dependencies:

```sh
pnpm install
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
