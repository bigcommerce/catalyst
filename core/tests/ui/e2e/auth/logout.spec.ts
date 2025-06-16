import { expect, test } from '~/tests/fixtures';

test('Logout works as expected', async ({ page, customer }) => {
  await customer.login();

  await page.goto(`/logout/`);
  await expect(page).toHaveURL('/login/');

  await page.goto('/account/orders');
  await expect(page).toHaveURL('/login/');
});

test('Logout with redirectTo query parameter logs out customer and redirects to the path', async ({
  page,
  customer,
}) => {
  await customer.login();

  const redirectTo = '/test-path/';

  await page.goto(`/logout?redirectTo=${redirectTo}`);
  await expect(page).toHaveURL(redirectTo);

  // Ensure the customer is logged out
  await page.goto('/account/orders');
  await expect(page).toHaveURL('/login/');
});
