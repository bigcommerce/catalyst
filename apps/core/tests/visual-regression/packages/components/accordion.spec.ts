import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

const divStateOpen = 'div[data-state="open"]';
const divStateClosed = 'div[data-state="closed"]';

test('accordion expanded', async ({ page }) => {
  await page.goto(routes.SHOP_ALL);

  await expect(page.locator(divStateOpen).first()).toHaveScreenshot();
});

test('accordion closed', async ({ page }) => {
  await page.goto(routes.SHOP_ALL);
  await page.getByRole('button', { name: 'Brand' }).click();
  await page.waitForLoadState('networkidle');
  await page.locator(divStateClosed).first().waitFor({ state: 'visible' });

  await expect(page.locator(divStateClosed).first()).toHaveScreenshot();
});
