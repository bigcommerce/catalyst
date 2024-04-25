import { expect, test } from '@playwright/test';
import { LoginPage } from '../../../../pages/login-page';

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page }) => {
  await LoginPage.loginAsShopper(page);
  await page.getByRole('heading', { name: 'My Account' }).waitFor();

  await expect(page).toHaveURL('/.*account');
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wish lists' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();

})
