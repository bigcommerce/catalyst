import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Label with input', async ({ page }) => {
  await page.goto(routes.LOGIN);
  await expect(page.getByText('Password', { exact: true })).toBeVisible();

  await expect(
    page.getByText('Password', { exact: true }).locator('..').locator('..'),
  ).toHaveScreenshot();
});
