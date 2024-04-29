import { expect, test } from '@playwright/test';

test('Footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section').filter({ hasText: 'CategoriesShop' })).toBeVisible();

  await expect(page.locator('section').filter({ hasText: 'CategoriesShop' })).toHaveScreenshot();
});
