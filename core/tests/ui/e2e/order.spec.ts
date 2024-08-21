import { expect, test } from '~/tests/fixtures';

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

test('Orders page has empty state', async ({ page, account }) => {
  const customer = await account.create();

  await customer.login();

  await page.goto('/account/orders/');

  await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  await expect(page.getByText('No orders yet')).toBeVisible();
});

test('Order details are visible on Orders page', async ({ page, account, order }) => {
  const customer = await account.create();

  await customer.login();

  const orderDetails = await order.create(94, customer.id);

  await page.goto('/account/orders/');

  const formattedTotal = formatAmount(parseFloat(orderDetails.total_inc_tax));
  const formattedDate = formatDate(orderDetails.date_created);

  await expect(page.getByRole('link', { name: `Order # ${orderDetails.id}` })).toBeVisible();
  await expect(page.getByText('Order placed')).toBeVisible();
  await expect(page.getByText(formattedDate)).toBeVisible();
  await expect(page.getByText('Total')).toBeVisible();
  await expect(page.getByText(formattedTotal).first()).toBeVisible();
  await expect(page.getByText(orderDetails.status)).toBeVisible();
  await expect(page.getByRole('link', { name: '[Sample] Oak Cheese Grater' })).toBeVisible();
});
