import { expect, test } from '@playwright/test';
import { LoginPage } from '../../../../pages/login-page';

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page }) => {
  await LoginPage.loginAsShopper(page);

  await expect(page).toHaveURL('/.*account/');
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wish lists' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();

  await page.getByRole('heading', { name: 'Orders' }).click();
  await expect(page).toHaveURL('/.*orders/');
  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();

  await page.getByRole('tab', { name: 'Messages' }).click();
  await expect(page).toHaveURL('/.*messages/');
  await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();

  await page.getByRole('tab', { name: 'Addresses' }).click();
  await expect(page).toHaveURL('/.*addresses/');
  await expect(page.getByRole('heading', { name: 'Addresses' })).toBeVisible();

  await page.getByRole('tab', { name: 'Wish lists' }).click();
  await expect(page).toHaveURL('/.*wishlists/');
  await expect(page.getByRole('heading', { name: 'Wish lists' })).toBeVisible();

  await page.getByRole('tab', { name: 'Recently viewed' }).click();
  await expect(page).toHaveURL('/.*recently-viewed/');
  await expect(page.getByRole('heading', { name: 'Recently viewed' })).toBeVisible();

  await page.getByRole('tab', { name: 'Account settings' }).click();
  await expect(page).toHaveURL('/.*settings/');
  await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible();
})
