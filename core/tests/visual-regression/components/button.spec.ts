import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Primary button', async ({ page }) => {
  // Arrange
  await page.goto(routes.ORBIT_TERRARIUM_LARGE);

  // Act
  const button = page.getByRole('button', { name: 'Add to cart' });

  await button.waitFor();

  // Assert
  await expect(button).toHaveScreenshot();
});

test('Secondary button', async ({ page }) => {
  // Arrange
  await page.goto(routes.SHOP_ALL);

  const button = page.getByRole('button', { name: 'Update price' });

  await button.waitFor();

  // Assert
  await expect(button).toHaveScreenshot();
});

test('As a child', async ({ page }) => {
  // Arrange
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }).waitFor();

  // Act
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();
  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await page.getByText('Shipping cost').waitFor();

  // Assert
  await expect(page.getByRole('button', { name: 'Add' }).first()).toHaveScreenshot();
});
