import { expect, test } from '@playwright/test';

test('Carousel', async ({ page }) => {
  // Arrange
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Act
  const slides = page.getByRole('region', { name: 'Featured products' });

  // Assert
  await expect(slides).toHaveScreenshot();
});
