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
    'Able Brewing System',
  ]);

  await expect(page.getByRole('link', { name: 'Compare (3)' })).toBeVisible();
  expect(ProductPage.isProductInCompare(page, 'Orbit Terrarium - Large')).toBeTruthy();
  expect(ProductPage.isProductInCompare(page, 'Orbit Terrarium - Small')).toBeTruthy();
  expect(ProductPage.isProductInCompare(page, 'Able Brewing System')).toBeTruthy();

  await page.getByRole('link', { name: 'Compare (3)' }).click();
  await expect(page.getByRole('heading', { name: 'Comparing 3 products' })).toBeVisible();
});

test('Add and remove products to compare', async ({ page }) => {
  await ProductActions.addProductsToCompare(page, [
    'Orbit Terrarium - Large',
    'Orbit Terrarium - Small',
    'Able Brewing System',
    'Fog Linen Chambray Towel',
  ]);

  await expect(page.getByRole('link', { name: 'Compare (4)' })).toBeVisible();
  expect(ProductPage.isProductInCompare(page, 'Orbit Terrarium - Large')).toBeTruthy();
  expect(ProductPage.isProductInCompare(page, 'Orbit Terrarium - Small')).toBeTruthy();
  expect(ProductPage.isProductInCompare(page, 'Able Brewing System')).toBeTruthy();
  expect(ProductPage.isProductInCompare(page, 'Fog Linen Chambray Towel')).toBeTruthy();

  await ProductActions.removeProductsInCompare(page, 'Orbit Terrarium - Large');
  await ProductActions.removeProductsInCompare(page, 'Orbit Terrarium - Small');
  await expect(page.getByRole('link', { name: 'Compare (2)' })).toBeVisible();
});
