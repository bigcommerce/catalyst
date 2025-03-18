import { expect, test } from '~/tests/fixtures';

test('Order contains all necessary info and sections on Order Details page', async ({
  page,
  account,
  order,
}) => {
  const customer = await account.create();

  await customer.login();

  const orderDetails = await order.create(98, customer.id);

  await page.goto('/account/orders/');
  await expect(page.getByRole('link', { name: `Order # ${orderDetails.id}` })).toBeVisible();

  await page.getByRole('link', { name: 'View Details' }).click();
  await page.waitForURL(`/account/order/${orderDetails.id}/`);

  await expect(page.getByRole('heading', { name: `Order #${orderDetails.id}` })).toBeVisible();
  await expect(page.getByText('Order contents')).toBeVisible();
  await expect(page.getByText('Order Summary')).toBeVisible();
  await expect(page.getByText('Shipping', { exact: true })).toBeVisible();
});
