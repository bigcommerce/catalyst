import { expect, test } from '~/tests/fixtures';
import { getFormatter } from '~/tests/lib/formatter';
import { getTranslations } from '~/tests/lib/i18n';

test.describe('Account order details page', () => {
  test('Order details page is displayed and uses correct formatting', async ({
    page,
    catalog,
    customer,
    order,
  }) => {
    const t = await getTranslations('Account.Orders.Details');
    const format = getFormatter();
    const { id: customerId } = await customer.login();
    const orderDetails = await order.createWithDefaultProduct(customerId);
    const { name: productName } = await catalog.getDefaultProduct();

    await page.goto(`/account/orders/${orderDetails.id}/`);

    const formattedTotal = format.number(Number(orderDetails.totalIncTax), {
      style: 'currency',
      currency: orderDetails.currencyCode,
    });

    await expect(
      page.getByText(t('title', { orderNumber: String(orderDetails.id) })).first(),
    ).toBeVisible();

    await expect(page.getByText(t('summaryTotal')).first()).toBeVisible();
    await expect(page.getByText(formattedTotal).first()).toBeVisible();

    await expect(page.getByText(orderDetails.status).first()).toBeVisible();
    await expect(page.getByRole('link', { name: productName }).first()).toBeVisible();

    await expect(page.getByText(t('destination')).first()).toBeVisible();
    await expect(page.getByText(t('shippingAddress')).first()).toBeVisible();
  });
});
