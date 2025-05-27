/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { expect as baseExpect, test as baseTest } from '@playwright/test';
import { validate as isUuid } from 'uuid';

import { testEnv } from '~/tests/environment';
import { TAGS } from '~/tests/tags';

import { extendedBrowser } from './browser';
import { CatalogFixture } from './catalog';
import { CustomerFixture } from './customer';
import { OrderFixture } from './order';
import { extendedPage, toHaveURL } from './page';
import { AccountFactory } from './utils/account';

interface Fixtures {
  /**
   * This fixture enables the creation, deletion, and the ability to login and logout of customer accounts.
   */
  account: AccountFactory;
  order: OrderFixture;
  catalog: CatalogFixture;
  customer: CustomerFixture;
  /**
   * 'reuseCustomerSession' sets the the configuration for the customer fixture and determines whether to reuse the customer session.
   * For example, in login tests we do not want to reuse the session so we call `test.use({ reuseCustomerSession: false });`
   */
  reuseCustomerSession: boolean;
  skipWritesOnReadonly: void;
  page: ReturnType<typeof extendedPage>;
}

export const test = baseTest.extend<Fixtures>({
  page: [
    async ({ page }, use) => {
      await use(extendedPage(page));
    },
    { scope: 'test' },
  ],
  browser: [
    async ({ browser }, use) => {
      await use(extendedBrowser(browser));
    },
    { scope: 'worker' },
  ],
  account: [
    // TODO: Delete and replace all usage with customer fixture
    async ({ page }, use) => {
      const accountFactory = new AccountFactory(page);

      await use(accountFactory);

      await accountFactory.cleanup();
    },
    { scope: 'test' },
  ],
  order: [
    async ({ page }, use, currentTest) => {
      const orderFixture = new OrderFixture(page, currentTest);

      await use(orderFixture);

      await orderFixture.cleanup();
    },
    { scope: 'test' },
  ],
  catalog: [
    async ({ page }, use, currentTest) => {
      const catalogFixture = new CatalogFixture(page, currentTest);

      await use(catalogFixture);

      await catalogFixture.cleanup();
    },
    { scope: 'test' },
  ],
  customer: [
    async ({ page, reuseCustomerSession }, use, currentTest) => {
      const customerFixture = new CustomerFixture(reuseCustomerSession, page, currentTest);

      await use(customerFixture);

      await customerFixture.cleanup();
    },
    { scope: 'test' },
  ],
  reuseCustomerSession: [true, { option: true }],
  skipWritesOnReadonly: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, currentTest) => {
      if (currentTest.tags.includes(TAGS.writesData) && testEnv.TESTS_READ_ONLY) {
        currentTest.skip(true, 'Test environment is set to read-only mode.');
      }

      await use();
    },
    { auto: true },
  ],
});

export const expect = baseExpect.extend({
  toBeUuid(received) {
    const pass = isUuid(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a uuid`,
        pass: true,
      };
    }

    return {
      message: () => `expected ${received} to be a uuid`,
      pass: false,
    };
  },
  toHaveURL,
});

export { type Page } from '@playwright/test';
