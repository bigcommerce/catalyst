// Disabling the rule as this should be the only place where we import test and expect from Playwright
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { expect as baseExpect, test as baseTest } from '@playwright/test';
import { validate as isUuid } from 'uuid';

import { testEnv } from '~/tests/environment';
import { TAGS } from '~/tests/tags';

import { BlogFixture } from './blog';
import { extendedBrowser } from './browser';
import { CatalogFixture } from './catalog';
import { CurrencyFixture } from './currency';
import { CustomerFixture } from './customer';
import { OrderFixture } from './order';
import { extendedPage, toHaveURL } from './page';
import { PromotionFixture } from './promotion';
import { WebPageFixture } from './webpage';

interface Fixtures {
  blog: BlogFixture;
  order: OrderFixture;
  catalog: CatalogFixture;
  customer: CustomerFixture;
  currency: CurrencyFixture;
  promotion: PromotionFixture;
  webPage: WebPageFixture;
  /**
   * 'reuseCustomerSession' sets the the configuration for the customer fixture and determines whether to reuse the customer session.
   * For example, in login tests we do not want to reuse the session so we call `test.use({ reuseCustomerSession: false });`
   */
  reuseCustomerSession: boolean;
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
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
  blog: [
    async ({ page }, use, currentTest) => {
      const blogFixture = new BlogFixture(page, currentTest);

      await use(blogFixture);

      await blogFixture.cleanup();
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
  currency: [
    async ({ page }, use, currentTest) => {
      const currencyFixture = new CurrencyFixture(page, currentTest);

      await use(currencyFixture);

      await currencyFixture.cleanup();
    },
    { scope: 'test' },
  ],
  promotion: [
    async ({ page }, use, currentTest) => {
      const promotionFixture = new PromotionFixture(page, currentTest);

      await use(promotionFixture);

      await promotionFixture.cleanup();
    },
    { scope: 'test' },
  ],
  webPage: [
    async ({ page }, use, currentTest) => {
      const webPageFixture = new WebPageFixture(page, currentTest);

      await use(webPageFixture);

      await webPageFixture.cleanup();
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
