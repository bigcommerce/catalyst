import { expect, test } from '@playwright/test';

import { testUser } from '~/tests/test-data';

test('tabs', async ({ page }) => {
  // Arrange
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByLabel('Email')).toBeVisible();
  await page.getByLabel('Email').fill(testUser.emailAddress);
  await page.getByLabel('Password').fill(testUser.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('heading', { name: 'My Account', level: 1 }).waitFor();
  await page.getByRole('link', { name: 'Orders' }).click();
  await page.getByRole('heading', { name: 'Orders', level: 2 }).waitFor();

  // Act
  const accountTabs = page.getByRole('tablist', { name: 'Account Tabs' });

  // Assert
  await expect(accountTabs).toHaveScreenshot();
});
