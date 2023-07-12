# packages/client

## How to section

### How to use graphql types generation?

Required env variables in .env.local:

- BIGCOMMERCE_STORE_HASH
- BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN

Run `pnpm run gen-types`

Note: don't use createClient from  `./src/generated/index.ts` (or better remove it)
