import { expect, test } from '@playwright/test';

const productName = '[Sample] Smith Journal 13';

test('Search for a product', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await expect(searchBox).toBeVisible();

  await searchBox.fill(productName);
  await searchBox.press('Enter');

  await expect(page.getByRole('link', { name: productName })).toBeVisible();
});
