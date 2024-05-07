import { expect, test } from '@playwright/test';

test('Slideshow multiple slides', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const slideshow = page.getByLabel('Interactive slide show');

  await slideshow.waitFor();

  // Assert
  await expect(slideshow).toHaveScreenshot();
});

test('Slideshow paused', async ({ page }) => {
  // Arrange
  await page.goto('/');

  // Act
  const slideshow = page.getByLabel('Interactive slide show');

  await slideshow.waitFor();
  await page.getByLabel('Pause slideshow').click();

  // Assert
  await expect(slideshow).toHaveScreenshot();
});
