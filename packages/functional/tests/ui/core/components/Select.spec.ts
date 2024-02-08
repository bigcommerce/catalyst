import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Shop All' })
    .click();
});

test('Sort products on display by review', async ({ page }) => {
  await page.getByLabel('Sort by:').click();
  await page.getByText('By review').click();

  await expect(page).toHaveURL('shop-all/?sort=best_reviewed');
});

test('Sort products on display by ascending price', async ({ page }) => {
  await page.getByLabel('Sort by:').click();
  await page.getByText('Price: ascending').click();

  await expect(page).toHaveURL('shop-all/?sort=lowest_price');
});

test('Sort products on display by descending price', async ({ page }) => {
  await page.getByLabel('Sort by:').click();
  await page.getByText('Price: descending').click();

  await expect(page).toHaveURL('shop-all/?sort=highest_price');
});

test('Sort products on display by relevance', async ({ page }) => {
  await page.getByLabel('Sort by:').click();
  await page.getByText('Relevance').click();

  await expect(page).toHaveURL('shop-all/?sort=relevance');
});
