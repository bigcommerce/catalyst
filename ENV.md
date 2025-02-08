## Environement setup

Setup AWS SSO for profile AdministratorAccess-242201303751 & Avios Retail Dev
~ aws configure sso

Clone repo <git@github.com>:leighton-digital/wf-catalyst.git your-folder-name

~ cd your-folder-name

Switch to `develop` branch and create a branch named

feature/your-branch-name

Enable pnpm - I think by this?
corepack enable pnpm

~ pnpm install
~ pnpm create @bigcommerce/catalyst@latest init

Follow the authentication flow. You will need to log into BigCommerce
Until we connect to WF Store we will us our own - speak to Software Dev team for access.

Account - Leighton
Store - Leighton Test Store
Which channel would you like to use? wf-catalyst-canary-channel

This will create .env.local

~ cp .env.local ./core
~ cd core
~ pnpm run sst:dev

This will run a local instance of catalyst pointing to our test store front.

To deploy to AWS use

~ pnpm run sst:deploy

This will use your branch name to kinda make empheral environment
