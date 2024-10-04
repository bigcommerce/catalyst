import { test as base } from '@playwright/test';

import { AccountFactory } from './utils/account';
import { OrderFactory } from './utils/order';

interface Fixtures {
  /**
   * This fixture enables the creation, deletion, and the ability to login and logout of customer accounts.
   */
  account: AccountFactory;
  order: OrderFactory;
}

export const test = base.extend<Fixtures>({
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

export { expect, type Page } from '@playwright/test';
