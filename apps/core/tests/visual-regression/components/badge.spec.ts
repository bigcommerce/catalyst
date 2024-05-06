import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('badge with icon', async ({ page }) => {
  // Arrange
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }).waitFor();
  await page.getByRole('button', { name: 'Add to Cart' }).click();

  const addToCartNotification = page
    .getByRole('status')
    .filter({ hasText: 'Item added to your cart' });

  // Wait for the add to cart notification to appear and disappear
  await addToCartNotification.waitFor();
  await addToCartNotification.waitFor({ state: 'detached' });

  // Act
  const badge = page.getByRole('link', { name: 'Cart Items 1' });

  // Assert
  await expect(badge).toHaveScreenshot();
});
