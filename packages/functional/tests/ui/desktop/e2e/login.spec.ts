import { expect, test } from '@playwright/test';
import { LoginPage } from '../../../../pages/login-page';

test('Account login and logout', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Login').click();
  await expect(page.getByLabel('Email')).toBeVisible();

  await page.getByLabel('Email').fill(LoginPage.testAccountEmail);
  await page.getByLabel('Password').fill(LoginPage.testAccountPassword);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

  await page.getByLabel('Account').click();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
