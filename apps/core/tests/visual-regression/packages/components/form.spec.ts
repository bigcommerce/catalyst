import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Form', async ({ page }) => {
  await page.goto(routes.CONTACT_US);
  await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Contact Us' }).locator('..').locator('..'),
  ).toHaveScreenshot();
});
