import { expect, test } from '~/tests/fixtures';

test('Account login and logout', async ({ page, account }) => {
  const customer = await account.create();

  await page.goto('/');

  await page.getByLabel('Login').click();
  await expect(page.getByLabel('Email')).toBeVisible();

  await page.getByLabel('Email').fill(customer.email);
  await page.getByLabel('Password').fill(customer.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL('/account/');

  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();

  await customer.logout();

  await page.waitForURL('/en/login/');

  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
});
