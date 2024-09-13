import { expect, Page, test } from '~/tests/fixtures';

async function selectProductForComparison(page: Page, name: string) {
  const productInformation = page.getByRole('heading', { name }).locator('..');
  const compareButton = productInformation.getByLabel('Compare');

  await compareButton.scrollIntoViewIfNeeded();

  await compareButton.click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Shop all' })).toBeVisible();
});

test('Validate product page', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Brand' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Brand' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Color' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Size' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Price', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rating' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Other' })).toBeVisible();
  await expect(page.getByLabel('Sort by:')).toBeVisible();
});

test('Compare products', async ({ page }) => {
  await selectProductForComparison(page, 'Smith Journal 13');
  await selectProductForComparison(page, 'Utility Caddy');
  await selectProductForComparison(page, 'Laundry Detergent');

  await expect(page.getByRole('link', { name: 'Compare (3)' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Remove [Sample] Smith Journal 13 from compare list' }),
  ).toBeAttached();
  await expect(
    page.getByRole('button', { name: 'Remove [Sample] Utility Caddy from compare list' }),
  ).toBeAttached();
  await expect(
    page.getByRole('button', { name: 'Remove [Sample] Laundry Detergent from compare list' }),
  ).toBeAttached();

  await page.getByRole('link', { name: 'Compare (3)' }).click();
  await expect(page.getByRole('heading', { name: 'Comparing 3 products' })).toBeVisible();
});

test('Add and remove products to compare', async ({ page }) => {
  await selectProductForComparison(page, 'Smith Journal 13');
  await selectProductForComparison(page, 'Utility Caddy');
  await selectProductForComparison(page, 'Laundry Detergent');

  await expect(page.getByRole('link', { name: 'Compare (3)' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Remove [Sample] Smith Journal 13 from compare list' }),
  ).toBeAttached();
  await expect(
    page.getByRole('button', { name: 'Remove [Sample] Utility Caddy from compare list' }),
  ).toBeAttached();
  await expect(
    page.getByRole('button', { name: 'Remove [Sample] Laundry Detergent from compare list' }),
  ).toBeAttached();

  await page
    .getByRole('button', { name: `Remove [Sample] Smith Journal 13 from compare list` })
    .click();
  await expect(page.getByRole('link', { name: 'Compare (2)' })).toBeVisible();
});

test('Out of stock products show disabled "Out of stock" button', async ({ page }) => {
  await page.goto('1-l-le-parfait-jar/?112=117&111=113');

  await expect(page.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
});
