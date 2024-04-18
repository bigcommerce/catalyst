import { expect, test } from '@playwright/test';

import { CartActions } from '../../../../actions/cart-actions';
import { ProductActions } from '../../../../actions/product-actions';

const sampleProduct = '[Sample] Able Brewing System';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).click();
  await expect(page.getByRole('heading', { level: 3, name: sampleProduct })).toBeVisible();

  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByText(sampleProduct, { exact: true })).toBeVisible();
});

test('Add shipping estimates', async ({ page }) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await CartActions.addEstimatedShippingCosts(page, 'United States', 'Texas', 'Austin', '76267');
  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
});

test('Update shipping estimates', async ({ page }) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await CartActions.addEstimatedShippingCosts(page, 'United States', 'Texas', 'Austin', '76267');

  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
  await page.getByRole('button', { name: 'Change' }).click();

  await CartActions.addEstimatedShippingCosts(
    page,
    'United States',
    'Massachusetts',
    'Boston',
    '01762',
  );

  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
});

test('Add shipping estimates for Canada', async ({ page }) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await CartActions.addEstimatedShippingCosts(
    page,
    'Canada',
    'British Columbia',
    'Vancouver',
    '98617',
  );
  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
});
