import { expect, test } from '@playwright/test';

test('Slideshow multiple slides', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Interactive slide show')).toBeVisible();

  await expect(page.getByLabel('Interactive slide show')).toHaveScreenshot();
});

test('Slideshow paused', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Interactive slide show')).toBeVisible();
  await page.getByLabel('Pause slideshow').click();

  await expect(page.getByLabel('Interactive slide show')).toHaveScreenshot();
});
