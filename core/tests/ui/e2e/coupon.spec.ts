import { expect, test } from '~/tests/fixtures';

const couponCode = 'OFF25';

test.beforeEach(async ({ page }) => {
  await page.goto('/sample-able-brewing-system/');
  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Proceed to checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Add' }).nth(1).click();
});

test('Add coupon code', async ({ page }) => {
  const couponCodeBox = page.getByPlaceholder('Enter your coupon code');

  await couponCodeBox.fill(couponCode);
  await couponCodeBox.press('Enter');

  await expect(page.getByText(`Coupon (${couponCode})`)).toBeVisible();
});

test('Coupon code is required', async ({ page }) => {
  const couponCodeBox = page.getByPlaceholder('Enter your coupon code');

  await couponCodeBox.fill('');
  await couponCodeBox.press('Enter');

  await expect(page.getByText('Please enter a coupon code.')).toBeVisible();
});

test('Coupon code fails', async ({ page }) => {
  const couponCodeBox = page.getByPlaceholder('Enter your coupon code');

  await couponCodeBox.fill('INCORRECT_CODE');
  await couponCodeBox.press('Enter');

  await expect(page.getByText('The coupon code you entered is not valid.')).toBeVisible();
});

test('Apply coupon on checkout', async ({ page }) => {
  await page.getByRole('button', { name: 'Proceed to checkout' }).click();

  await expect(page.getByRole('link', { name: 'Coupon/Gift Certificate' })).toBeVisible();
  await expect(page.getByText('Total (USD) $225.00')).toBeVisible();

  await page.getByRole('link', { name: 'Coupon/Gift Certificate' }).click();
  await page.getByLabel('Gift Certificate or Coupon Code').fill(couponCode);
  await page.getByRole('button', { name: 'APPLY' }).click();

  await expect(page.getByText('Total (USD) $168.75')).toBeVisible();
});
