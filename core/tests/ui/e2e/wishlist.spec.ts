import { expect, test } from '~/tests/fixtures';

test('Guest user is redirected to login upon adding product to wishlist', async ({ page }) => {
  await page.goto('/laundry-detergent/');
  await page.getByRole('heading', { level: 1, name: '[Sample] Laundry Detergent' }).waitFor();

  await page.getByRole('link', { name: 'Save to wishlist' }).click();

  await expect(page).toHaveURL(/login/);
});

test('Add product to Favorites wishlist from PDP', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/laundry-detergent/');
  await page.getByRole('heading', { level: 1, name: '[Sample] Laundry Detergent' }).waitFor();
  await page.getByRole('button', { name: 'Save to wishlist' }).click();

  await expect(page.getByRole('heading', { name: 'Add to list' })).toBeVisible();
  await expect(page.getByText('Select from available lists:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();

  await page.getByLabel('Favorites').click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Close' }).click();

  await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();

  await page.goto('/account/wishlists/');
  await expect(page.getByText('[Sample] Laundry Detergent')).toBeVisible();
});

test('Add new wishlist from drawer', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/laundry-detergent/');
  await page.getByRole('heading', { level: 1, name: '[Sample] Laundry Detergent' }).waitFor();
  await page.getByRole('button', { name: 'Save to wishlist' }).click();
  await page.getByRole('button', { name: 'New list' }).click();
  await page.getByLabel('Wishlist name').fill('Birthday');
  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByText('Your wishlist Birthday was created successfully')).toBeVisible();

  await page.goto('/account/wishlists/');
  await expect(page.getByText('Birthday')).toBeVisible();
});

test('Add and remove new wishlist', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/wishlists');
  await page.getByRole('heading', { name: 'Wishlists' }).waitFor();

  await page.getByRole('button', { name: 'New wishlist' }).click();
  await page.getByLabel('Wishlist name').fill('Anniversary');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Your wishlist Anniversary was created successfully')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Anniversary' })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: /Delete/ }).click();
  await expect(page.getByText('Your wishlist Anniversary was deleted successfully')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'test' })).toBeHidden();
});
