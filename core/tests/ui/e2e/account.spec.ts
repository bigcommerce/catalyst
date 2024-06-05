import { expect, test } from '~/tests/fixtures';

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  // Prepending locale to URL as a workaround for issue in next-intl
  // More info: https://github.com/amannn/next-intl/issues/1335
  await expect(page).toHaveURL('/en/account/');
  await expect(page.getByRole('link', { name: 'Addresses' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wishlists' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Recently viewed' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Account settings' })).toBeVisible();

  await page.getByRole('link', { name: 'Addresses' }).click();
  await expect(page).toHaveURL('/account/addresses/');
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();

  await page.getByRole('link', { name: 'Wishlists' }).click();
  await expect(page).toHaveURL('/account/wishlists/');
  await expect(page.getByRole('heading', { name: 'Wishlists' })).toBeVisible();

  await page.getByRole('link', { name: 'Recently viewed' }).click();
  await expect(page).toHaveURL('/account/recently-viewed/');
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible();

  await page.getByRole('link', { name: 'Account settings' }).click();
  await expect(page).toHaveURL('/account/settings/');
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();

  await customer.logout();
});

test('Account dropdown is visible in header', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/');

  await page.getByRole('button', { name: 'Account' }).click();

  await expect(page.getByRole('menuitem', { name: 'Log out' })).toBeInViewport();

  // Click outside to close the dropdown
  await page.locator('html').click();

  await customer.logout();
});

test('Add and remove new wishlist', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/wishlists');
  await page.getByRole('heading', { name: 'Wishlists' }).waitFor();

  await page.getByRole('button', { name: 'New wishlist' }).click();
  await page.getByLabel('Wishlist name').fill('test');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Your wishlist test was created successfully')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'test' })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: /Delete/ }).click();
  await expect(page.getByText('Your wishlist test was deleted successfully')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'test' })).toBeHidden();
});
