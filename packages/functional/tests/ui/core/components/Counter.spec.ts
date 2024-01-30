import { expect, test } from '@playwright/test';
import { ProductActions } from '../../../../actions/product-actions';

test('Modify product quantity in cart and verify the results', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Shop All' }).click();

  await ProductActions.addProductToCart(page, '[Sample] Orbit Terrarium - Large');
  await page.getByRole('link').filter({ hasText: 'Cart Items1' }).click();

  await expect(page.getByRole('spinbutton')).toHaveValue('1');

  await page.getByLabel('Increase count').click();
  await page.getByLabel('Increase count').click();

  await expect(page.getByRole('spinbutton')).toHaveValue('3');

  await page.getByLabel('Decrease count').click();
  await page.getByLabel('Decrease count').click();
  await page.getByLabel('Decrease count').click();

  await expect(page.getByRole('spinbutton')).toHaveValue('0');
  await expect(page.getByLabel('Decrease count')).toBeDisabled();
});
