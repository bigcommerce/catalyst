import { expect, test } from '~/tests/fixtures';

test('Footer', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const footer = page.locator('section').filter({ hasText: 'CategoriesShop' });

  await footer.waitFor();

  // Assert
  await expect(footer).toHaveScreenshot();
});
