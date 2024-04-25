import { expect, test } from '@playwright/test';
import { LoginPage } from '../../../../pages/login-page';

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('My Account tabs are displayed and clickable', async ({ page }) => {
  await LoginPage.loginAsShopper(page);
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();


})
