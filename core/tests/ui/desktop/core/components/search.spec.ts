import { expect, test } from '@playwright/test';

const productName = '[Sample] Able Brewing System';

test('Search for specific product and verify results', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await expect(searchBox).toBeVisible();

  await searchBox.fill(productName);
  await searchBox.press('Enter');

  await expect(page.getByRole('link', { name: productName })).toBeVisible();
});
