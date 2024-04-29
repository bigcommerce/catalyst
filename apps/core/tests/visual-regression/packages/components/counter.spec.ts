import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Counter default', async ({ page }) => {
  await page.goto(routes.QUICK_ADD_77);
  await expect(page.getByRole('spinbutton', { name: 'Number' })).toBeVisible();

  await expect(page.getByRole('spinbutton', { name: 'Number' })).toHaveScreenshot();
});
