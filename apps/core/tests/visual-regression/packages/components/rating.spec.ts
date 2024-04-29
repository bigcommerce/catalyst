import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Zero star rating', async ({ page }) => {
  await page.goto(routes.FOG_LINEN_CHAMBRAY);
  await expect(page.getByRole('paragraph').getByRole('img').first()).toBeVisible();

  await expect(page.getByRole('paragraph').getByRole('img').first()).toHaveScreenshot();
});

test('Five start rating', async ({ page }) => {
  await page.goto(routes.PARFAIT_JAR);
  await expect(page.getByRole('paragraph').getByRole('img').first()).toBeVisible();
  await expect(page.getByRole('paragraph').getByRole('img').first()).toHaveScreenshot();
});

test('Floating rating', async ({ page }) => {
  await page.goto(routes.ORBIT_TERRARIUM_LARGE);
  await expect(page.getByRole('paragraph').getByRole('img').first()).toBeVisible();

  await expect(page.getByRole('paragraph').getByRole('img').first()).toHaveScreenshot();
});
