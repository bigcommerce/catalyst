import { test as base } from '@playwright/test';

import { ProductFactory } from '~/tests/fixtures/utils/product';

import { AccountFactory } from './utils/account';

interface Fixtures {
  /**
   * This fixture enables the creation, deletion, and the ability to login and logout of customer accounts.
   */
  account: AccountFactory;
  product: ProductFactory;
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
  product: [
    async ({ page }, use) => {
      const productFactory = new ProductFactory(page);

      await use(productFactory);

      await productFactory.cleanup();
    },
    { scope: 'test' },
  ],
});

export { expect, type Page } from '@playwright/test';
