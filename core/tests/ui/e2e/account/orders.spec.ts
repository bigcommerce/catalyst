import { expect, test } from '~/tests/fixtures';
import { getFormatter } from '~/tests/lib/formatter';
import { getTranslations } from '~/tests/lib/i18n';

test.describe('Account orders page', () => {
  test('Orders page has an empty state when no orders exist', async ({ page, customer, order }) => {
    const { id } = await customer.login();

    // Delete all orders for the customer to ensure test reliability
    await order.deleteAllCustomerOrders(id);

    const t = await getTranslations();

    await page.goto('/account/orders/');

    await expect(
      page.getByRole('heading', { name: t('Account.Orders.title'), exact: true }),
    ).toBeVisible();

    await expect(page.getByText(t('Account.Orders.emptyState.title'))).toBeVisible();
    await expect(
      page.getByRole('link', { name: t('Account.Orders.emptyState.cta') }),
    ).toBeVisible();
  });

  test('Order details are displayed and use correct formatting', async ({
    page,
    catalog,
    customer,
    order,
  }) => {
    const t = await getTranslations();
    const format = getFormatter();
    const { id: customerId } = await customer.login();
    const orderDetails = await order.createWithDefaultProduct(customerId);
    const { name: productName } = await catalog.getDefaultProduct();

    await page.goto('/account/orders/');

    const formattedTotal = format.number(Number(orderDetails.totalIncTax), {
      style: 'currency',
      currency: orderDetails.currencyCode,
    });

    await expect(page.getByText(t('Account.Orders.orderNumber')).first()).toBeVisible();
    await expect(page.getByText(String(orderDetails.id))).toBeVisible();

    await expect(page.getByText(t('Account.Orders.totalPrice')).first()).toBeVisible();
    await expect(page.getByText(formattedTotal).first()).toBeVisible();

    await expect(page.getByText(orderDetails.status).first()).toBeVisible();
    await expect(page.getByRole('link', { name: productName }).first()).toBeVisible();
  });
});
