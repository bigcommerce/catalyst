import { expect, test } from '~/tests/fixtures';

test('Order page is displayed', async ({ page, account, product, order }) => {
  const customer = await account.create();

  await customer.login();

  const orderProduct = await product.create();

  const orderDetails = await order.create(customer.id, orderProduct.id);

  await page.goto('/account/orders/');

  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
});
