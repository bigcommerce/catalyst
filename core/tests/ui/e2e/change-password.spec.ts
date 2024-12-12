import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';

// Prefix is added to ensure that the password requirements are met
const password = faker.internet.password({ pattern: /[a-zA-Z0-9]/, prefix: '1At', length: 10 });

test('Cannot change password with invalid reset token and customerId', async ({ page }) => {
  await page.goto('/change-password?c=123&t=test123');

  await page.getByRole('heading', { name: 'Change password' }).waitFor();

  await page.getByLabel('New passwordRequired', { exact: true }).fill(password);
  await page.getByLabel('Confirm passwordRequired').fill(password);

  await page.getByRole('button', { name: 'Change password' }).click();

  await expect(page.getByText('Invalid password reset token or customerEntityId.')).toBeVisible();
});

test('Change password from Account Settings and log in', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/settings/');
  await page.getByRole('link', { name: 'Change password' }).click();
  await page.getByLabel('Current passwordRequired', { exact: true }).fill(customer.password);
  await page.getByLabel('New passwordRequired', { exact: true }).fill(`${customer.password}1`);
  await page.getByLabel('Confirm passwordRequired', { exact: true }).fill(`${customer.password}1`);

  await page.getByRole('button', { name: 'Change password' }).click();

  await expect(
    page.getByText(
      'Your password has been successfully updated. Please log in using your new credentials.',
    ),
  ).toBeVisible();

  await page.goto('/account/orders/');
  await page.getByRole('heading', { name: 'Log In' }).waitFor();

  await page.getByLabel('Email').fill(customer.email);
  await page.getByLabel('Password').fill(`${customer.password}1`);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/account/orders/');
});
