import { expect, test } from '@playwright/test';

test('Navigation menu', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();

  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveScreenshot();
});
