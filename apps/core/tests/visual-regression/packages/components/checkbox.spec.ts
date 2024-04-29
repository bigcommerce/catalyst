import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Disabled checkbox', async () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Disabled checked checkbox', async () => {});

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Checkbox with error variant', async () => {});

test('Checked checkbox with label', async ({ page }) => {
  await page.goto(routes.SHOP_ALL);
  await page.getByLabel('Common Good1 products').click();

  await expect(page.getByLabel('Common Good1 products')).toHaveScreenshot();
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
test.skip('Checkbox with custom icon', async () => {});
