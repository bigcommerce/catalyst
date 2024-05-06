import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('badge with icon', async ({ page }) => {
  // Arrange
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }).waitFor();
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  // Act
  const badge = page.getByRole('link', { name: 'Cart Items 1' });

  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();

  // Assert
  await expect(badge).toHaveScreenshot();

  // Cleanup
  await page.getByRole('button', { name: 'Remove item from cart' }).first().click();
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
});
