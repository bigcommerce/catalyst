import { expect, test } from '@playwright/test';

test('Account access is restricted for guest users', async ({ page }) => {
  await page.goto('/account/settings');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible({ visible: false });
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});

test('Create user Account', async ({ page }) => {
  await page.goto('/login/');
  // click "Create Account" button
  // Fill out required fields
  // Click "Submit" button
  // Verify success message
  // Make sure user is able to login
})
