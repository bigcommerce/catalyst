import { expect, test } from '~/tests/fixtures';

test('Order page is displayed', async ({ page, account, product, order }) => {
  const customer = await account.create();

  await customer.login();

  const orderProduct = await product.create();

  // @ts-ignore
  console.log('orderProduct.variants is: ', orderProduct.variants);
  console.log('orderProduct.variants[0] is: ', orderProduct.variants[0]);
  // @ts-ignore
  console.log('orderProduct.variants[0].id is: ', orderProduct.variants[0].id);

  const orderDetails = await order.create(
    customer.id,
    orderProduct.id,
    // @ts-ignore
    orderProduct.variants[0].id,
  );

  console.log('orderDetails is: ', orderDetails);

  await page.goto('/account/orders/');

  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
});
