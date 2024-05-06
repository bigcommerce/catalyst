import { expect, test } from '@playwright/test';

test('Carousel', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const slides = page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) });

  await slides.getByRole('tablist', { name: 'Slides' }).scrollIntoViewIfNeeded();

  // Assert
  await expect(slides).toHaveScreenshot();
});
