import { expect, test } from '@playwright/test';

test('Footer', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const footer = page.locator('section').filter({ hasText: 'CategoriesShop' });

  await footer.waitFor();

  // Assert
  await expect(footer).toHaveScreenshot();
});
