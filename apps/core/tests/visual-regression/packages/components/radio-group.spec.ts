import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Default radio group', async ({ page }) => {
  await page.goto(routes.QUICK_ADD_77);
  await expect(page.getByRole('radiogroup', { name: 'Radio' })).toBeVisible();

  await expect(page.getByRole('radiogroup', { name: 'Radio' })).toHaveScreenshot();
});

test('Default radio group selected', async ({ page }) => {
  await page.goto(routes.QUICK_ADD_77);
  await expect(page.getByRole('radiogroup', { name: 'Radio' })).toBeVisible();
  await page.getByLabel('1', { exact: true }).click();

  await expect(page.getByRole('radiogroup', { name: 'Radio' })).toHaveScreenshot();
});
