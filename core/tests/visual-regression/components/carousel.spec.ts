import { expect, test } from '~/tests/fixtures';

test('Carousel', async ({ page }) => {
  // Arrange
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Act
  const slides = page.getByRole('region', { name: 'Featured products' });

  // Assert
  await expect(slides).toHaveScreenshot();
});
