import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('accordion expanded', async ({ page }) => {
  // Arrange
  await page.goto(routes.SHOP_ALL);

  // Act
  const accordion = page
    .locator('div[data-state="open"]')
    .filter({ has: page.getByRole('button', { name: 'Brand', expanded: true }) });

  // Assert
  await expect(accordion).toHaveScreenshot();
});

test('accordion closed', async ({ page }) => {
  // Arrange
  await page.goto(routes.SHOP_ALL);

  // Act
  await page.getByRole('button', { name: 'Brand', expanded: true }).click();

  const accordion = page
    .locator('div[data-state="closed"]')
    .filter({ has: page.getByRole('button', { name: 'Brand', expanded: false }) });

  // Assert
  await expect(accordion).toHaveScreenshot();
});
