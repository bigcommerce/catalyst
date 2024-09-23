import { expect, test } from '~/tests/fixtures';

test('Update Account information', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/settings');
  await page.getByLabel('First NameRequired').fill('Updated');
  await page.getByLabel('Last NameRequired').fill('Name');
  await page.getByLabel('Phone Number').fill('12345678');
  await page.getByLabel('Company').fill('Corporation');
  await page.getByLabel('Email Address').fill('updated@email.com');

  await page.getByRole('button', { name: 'Update settings' }).click();

  await expect(
    page.getByText('Dear Updated Name, you successfully updated your account data'),
  ).toBeVisible();
  await expect(page.getByLabel('Company')).toHaveValue('Corporation');
  await expect(page.getByLabel('Phone Number')).toHaveValue('12345678');
  await expect(page.getByLabel('Email Address')).toHaveValue('updated@email.com');
});
