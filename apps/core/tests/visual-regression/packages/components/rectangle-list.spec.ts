import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Rectangle list', async ({ page }) => {
  await page.goto(routes.PARFAIT_JAR);
  await expect(page.getByRole('radiogroup', { name: 'Size' })).toBeVisible();

  await expect(page.getByRole('radiogroup', { name: 'Size' })).toHaveScreenshot();
});
