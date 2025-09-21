# Testing your Catalyst storefront

This document provides an overview of how to run tests for your Catalyst storefront. This includes the requirements, environment setup, folder structure, and best practices. This README assumes that you already have a Catalyst storefront set up and all of the dependencies installed.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment setup](#environment-setup)
- [Running tests](#running-tests)

## Prerequisites

- Ensure that you have already installed and set up Playwright. (See the [Playwright documentation](https://playwright.dev/docs/intro) for more information.)
- **Recommended**: Install the Playwright VSCode extension for easier test management and execution.

## Environment setup

To run tests, you first need to make sure you have the necessary environment setup. You should have already installed the required dependencies and configured your Catalyst environment in `.env.local`.

To begin, copy `.env.test.example` to `.env.test`. The Catalyst test environment merges `.env.local` with `.env.test.local`, so any test-related environment variables should **only** be in `.env.test.local`. This allows you to keep your test configuration separate from your development configuration.

**NOTE:** Any environment variables defined in `.env.test.local` will override those in `.env.local`.

## Running tests

When running tests locally, ensure that you have an active build for your Catalyst storefront by running `pnpm build`. This will ensure that the latest changes are included in the tests. Alternatively, you can use `pnpm dev` to run the development server, but this is not recommended.

When running tests against a live deployment, ensure that you have set the `PLAYWRIGHT_TEST_BASE_URL` environment variable to the URL of your live deployment storefront, and ensure that `TESTS_READ_ONLY` is set accordingly for your needs.

**NOTE:** The examples use `pnpm`, but you can also use `npx` if you prefer. Additionally, you can leverage the Playwright VSCode extension to run your tests.

### CLI commands

To run all of the tests, use the following command:

```bash
pnpm playwright test
```

To run a specific test file, you can specify the path to the test file:

```bash
pnpm playwright test auth/logout.spec.ts
```

To run a specific test within a file, you can use the `-g` flag followed by the name of the test:

```bash
pnpm playwright test auth/logout.spec.ts -g "Logout works as expected"
```

For more information on the available CLI commands, refer to the [Playwright CLI documentation](https://playwright.dev/docs/test-cli).
