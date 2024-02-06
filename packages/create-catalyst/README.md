# packages/create-catalyst

> [!WARNING]
> The create-catalyst package is in development and not published to the NPM registry

Scaffolding for Catalyst storefront projects.

## Usage

**NPM:**

```sh
npm create @bigcommerce/catalyst@latest my-catalyst-store
```

**PNPM:**

```sh
pnpm create @bigcommerce/catalyst@latest my-catalyst-store
```

**Yarn:**

```sh
yarn create @bigcommerce/catalyst@latest my-catalyst-store
```

## Contributing

**Prerequisites:**

- Node `>=18.16`
- [Verdaccio](https://verdaccio.org/) `>=5`

**Developing Locally:**

While developing `create-catalyst` locally, it's essential to test your changes before publishing them to NPM. To achieve this, we utilize Verdaccio, a lightweight private npm proxy registry that you can run in your local environment. By publishing `create-catalyst` to Verdaccio during local development, we can point `[yarn|npm|pnpm] create @bigcommerce/catalyst` at the Verdaccio registry URL and observe how our changes will behave once they are published to NPM.

1. Install Verdaccio: https://verdaccio.org/docs/installation
2. Run Verdaccio: `verdaccio --listen 4873`
3. Add an NPM user with `@bigcommerce` scope to Verdaccio: `npm adduser --scope=@bigcommerce --registry=http://localhost:4873`

> ⚠️ **IMPORTANT:** NPM registry data is immutable, meaning once published, a package cannot change. Be careful to ensure that you do not run commands such as `publish` against the default NPM registry if your work is not ready to be published. Always explicitly pass `--registry=http://localhost:<VERDACCIO_PORT>` with commands that modify the registry (such as `publish`) to ensure you only publish to Verdaccio when working locally.

4. If necessary, run `pnpm build` and `pnpm publish --registry=http://localhost:4873` in each Catalyst-scoped package required by relevant examples listed in `apps/` (e.g., Catalyst `core` examples require `@bigcommerce/components`, `@bigcommerce/eslint-config-catalyst`, `@bigcommerce/catalyst-configs`, `@bigcommerce/catalyst-client`)
5. Run `pnpm build` and `pnpm publish --registry=http://localhost:4873` in the `@bigcommerce/create-catalyst` package
6. Confirm published packages are listed in Verdaccio: http://localhost:4873

In order to point `npm create`, `pnpm create`, and/or `yarn create` to the Verdaccio registry, run one or more of the following commands against the package manager's global configuration:

- **NPM:** `npm config set @bigcommerce:registry http://localhost:4873`
- **PNPM:** `pnpm config set @bigcommerce:registry http://localhost:4873`
- **Yarn:** `yarn config set npmScopes.bigcommerce.npmRegistryServer "http://localhost:4873" -H` and then `yarn config set unsafeHttpWhitelist "localhost" -H`

7. Finally, navigate to the directory in which you'd like to create a new Catalyst storefront, and run `[yarn|npm|pnpm] create @bigcommerce/catalyst name-of-your-catalyst-storefront`
