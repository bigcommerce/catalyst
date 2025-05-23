// Disabling the rule as this should be the only place where we import test and expect from Playwright
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { expect as baseExpect, test as baseTest } from '@playwright/test';
import { validate as isUuid } from 'uuid';

import { AccountFactory } from './utils/account';
import { OrderFactory } from './utils/order';

interface Fixtures {
  /**
   * This fixture enables the creation, deletion, and the ability to login and logout of customer accounts.
   */
  account: AccountFactory;
  order: OrderFactory;
}

export const test = baseTest.extend<Fixtures>({
  account: [
    async ({ page }, use) => {
      const accountFactory = new AccountFactory(page);

      await use(accountFactory);

      await accountFactory.cleanup();
    },
    { scope: 'test' },
  ],
  order: [
    async ({ page }, use) => {
      const orderFactory = new OrderFactory(page);

      await use(orderFactory);

      await orderFactory.cleanup();
    },
    { scope: 'test' },
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
});
