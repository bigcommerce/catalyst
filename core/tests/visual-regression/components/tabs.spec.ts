import { expect, test } from '@playwright/test';

const testAccountEmail = process.env.TEST_ACCOUNT_EMAIL || '';
const testAccountPassword = process.env.TEST_ACCOUNT_PASSWORD || '';

test('tabs', async ({ page }) => {
  // Arrange
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByLabel('Email')).toBeVisible();
  await page.getByLabel('Email').fill(testAccountEmail);
  await page.getByLabel('Password').fill(testAccountPassword);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('heading', { name: 'My Account', level: 1 }).waitFor();
  await page.getByRole('link', { name: 'Orders' }).click();
  await page.getByRole('heading', { name: 'Orders', level: 2 }).waitFor();

  // Act
  const accountTabs = page.getByRole('tablist', { name: 'Account Tabs' });

  // Assert
  await expect(accountTabs).toHaveScreenshot();
});
