import { expect, test } from '@playwright/test';

import { CartActions } from '../../actions/cart-actions';
import { ProductActions } from '../../actions/product-actions';
import { CartPage } from '../../pages/cart-page';

const sampleProduct = '[Sample] Able Brewing System';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).click();
  await page.waitForSelector(CartPage.PRODUCT_HEADING, { state: 'visible' });
});

test('Add a single product to cart', async ({ page }) => {
  await ProductActions.isProductVisible(page, sampleProduct);
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.locator('a').filter({ hasText: 'Cart Items1' }).click();
  expect(await CartActions.isItemPresentInCart(page, sampleProduct)).toBeTruthy();
});

test('Edit product quantity in cart', async ({ page }) => {
  await ProductActions.isProductVisible(page, sampleProduct);
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.locator('a').filter({ hasText: 'Cart Items1' }).click();
  await page.getByRole('link', { name: 'Proceed to checkout' }).waitFor({ state: 'visible' });

  await page.getByLabel('Increase count').click();
  await expect(page.locator('a').filter({ hasText: 'Cart Items2' })).toBeVisible();

  await page.getByLabel('Decrease count').click();
  await expect(page.locator('a').filter({ hasText: 'Cart Items1' })).toBeVisible();
});

test('Proceed to checkout', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.locator('a').filter({ hasText: 'Cart Items1' }).click();
  await page.getByRole('link', { name: 'Proceed to checkout' }).click();

  await expect(page.getByRole('link', { name: sampleProduct })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Check out' })).toBeVisible();
});
