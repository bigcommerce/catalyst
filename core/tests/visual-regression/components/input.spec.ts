import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Input with placeholder', async ({ page }) => {
  // Arrange
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }).waitFor();

  // Act
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();
  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await page.getByText('Shipping cost').waitFor();
  await page.getByRole('button', { name: 'Add' }).first().click();

  const input = page.getByLabel('Suburb/city');

  await input.waitFor();

  // Assert
  await expect(input).toHaveScreenshot();
});

test('Input error state', async ({ page }) => {
  // Arrange
  await page.goto(routes.CONTACT_US);
  await page.getByRole('button', { name: 'Submit form' }).waitFor();

  // Act
  await page.getByRole('button', { name: 'Submit form' }).click();

  // Assert
  await expect(page.getByLabel('EmailRequired')).toHaveScreenshot();
});
