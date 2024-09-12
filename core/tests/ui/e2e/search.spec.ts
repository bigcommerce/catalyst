import { expect, test } from '~/tests/fixtures';

const productName = '[Sample] Smith Journal 13';

test('Search for a product and press key to view result page', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await expect(searchBox).toBeVisible();

  await searchBox.fill(productName);
  await searchBox.press('Enter');

  await expect(page.getByRole('link', { name: productName })).toBeVisible();
});

test('Search for a product and wait for results', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await searchBox.fill('Able Brewing System');

  await expect(page.getByRole('link', { name: '[Sample] Able Brewing System' })).toBeVisible();
});

test('Search a product with SKU', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await searchBox.fill('SM13');

  await expect(page.getByRole('link', { name: productName })).toBeVisible();
});

test('Search a product category', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await searchBox.fill('OFS');

  await expect(page.getByRole('link', { name: '[Sample] Utility Caddy' })).toBeVisible();
  await expect(page.getByRole('link', { name: '[Sample] Tiered Wire Basket' })).toBeVisible();
  await expect(page.getByRole('link', { name: '[Sample] Dustpan & Brush' })).toBeVisible();
  await expect(page.getByRole('link', { name: '[Sample] 1 L Le Parfait Jar' })).toBeVisible();
  await expect(page.getByRole('link', { name: '[Sample] Canvas Laundry Cart' })).toBeVisible();
});

test('Search dialog sections', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await searchBox.fill(productName);

  await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Brands' })).toBeVisible();
});

test('Search not found', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Open search popup').click();

  const searchBox = page.getByPlaceholder('Search...');

  await searchBox.fill('flora & fauna');

  await expect(page.getByText('No products matched with "flora & fauna"')).toBeVisible();
});
