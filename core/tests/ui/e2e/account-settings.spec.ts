import { expect, test } from '~/tests/fixtures';

test('Update Account information', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/settings');
  await page.getByLabel('First NameRequired').fill('Updated');
  await page.getByLabel('Last NameRequired').fill('Name');
  await page.getByLabel('Email Address').fill('updated@email.com');

  await page.getByRole('button', { name: 'Update settings' }).click();

  await expect(page.getByText('Your account settings have been updated')).toBeVisible();
  await expect(page.getByLabel('First NameRequired')).toHaveValue('Updated');
  await expect(page.getByLabel('Last NameRequired')).toHaveValue('Name');
  await expect(page.getByLabel('Email Address')).toHaveValue('updated@email.com');
});
