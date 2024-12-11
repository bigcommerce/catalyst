import { expect, test } from '~/tests/fixtures';

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await expect(page).toHaveURL('/account/orders/');
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

  const tabs = page.getByRole('navigation', { name: 'Account Tabs' });

  await expect(tabs.getByRole('link', { name: 'Orders' })).toBeVisible();
  await expect(tabs.getByRole('link', { name: 'Addresses' })).toBeVisible();
  await expect(tabs.getByRole('link', { name: 'Account settings' })).toBeVisible();

  await tabs.getByRole('link', { name: 'Addresses' }).click();
  await expect(page).toHaveURL('/account/addresses/');
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();

  await tabs.getByRole('link', { name: 'Account settings' }).click();
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
