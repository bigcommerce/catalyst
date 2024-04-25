import { expect, test } from '@playwright/test';

const sampleProduct = '[Sample] Able Brewing System';

test.beforeEach(async ({ page }) => {
  await page.goto('/sample-able-brewing-system/');
  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
});

test('Add a single product to cart', async ({ page }) => {
  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByText(sampleProduct, { exact: true })).toBeVisible();
});

test('Edit product quantity in cart', async ({ page }) => {
  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Increase count' }).click();

  await expect(page.getByRole('link', { name: 'Cart Items 2' })).toBeVisible();

  await page.getByRole('button', { name: 'Decrease count' }).click();
  await expect(page.getByRole('link', { name: 'Cart Items 1' })).toBeVisible();
});

test('Proceed to checkout', async ({ page }) => {
  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();

  await page.getByRole('link', { name: 'Proceed to checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Order Summary', level: 3 })).toBeVisible();
  await expect(page.getByRole('heading', { name: `1 x ${sampleProduct}`, level: 4 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shipping', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Billing', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Payment', level: 2 })).toBeVisible();
});
