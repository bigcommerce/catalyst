import { expect, test } from '@playwright/test';

test('Sort products on display according to selection', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();
  await page.getByLabel('Sort by:').click();
  await page.getByText('By review').click();

  await expect(page).toHaveURL('shop-all?sort=best_reviewed');

  await page.getByLabel('Sort by:').click();
  await page.getByText('Price: ascending').click();

  await expect(page).toHaveURL('shop-all?sort=lowest_price');

  await page.getByLabel('Sort by:').click();
  await page.getByText('Price: descending').click();

  await expect(page).toHaveURL('shop-all?sort=highest_price');

  await page.getByLabel('Sort by:').click();
  await page.getByText('Relevance').click();

  await expect(page).toHaveURL('shop-all?sort=relevance');
});
