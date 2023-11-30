import { expect, test } from '@playwright/test';

import { ProductActions } from '../../actions/product-actions';
import { ProductPage } from '../../pages/product-page';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();
  await page.waitForSelector(ProductPage.PRODUCT_HEADING, { state: 'visible' });
});

test('Validate product page', async ({ page }) => {
  await ProductPage.validateShopAllPage(page);
});

test('Compare products', async ({ page }) => {
  await ProductActions.addProductsToCompare(page, [
    'Orbit Terrarium - Large',
    'Orbit Terrarium - Small',
  ]);
  await expect(page.locator('a').filter({ hasText: 'Compare Items2' })).toBeVisible();

  await page.locator('a').filter({ hasText: 'Compare Items2' }).click();
  await expect(page.getByRole('heading', { name: 'Comparing 2 products' })).toBeVisible();
});
