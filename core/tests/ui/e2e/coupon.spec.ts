import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Valid coupon code can be applied to the cart', async ({ page, catalog, promotion }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const coupon = await promotion.createCouponCode();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();
  await page.waitForLoadState('networkidle');
  await page.goto('/cart');

  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  await page.getByLabel(t('Cart.CheckoutSummary.CouponCode.couponCode')).fill(coupon.code);
  await page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.apply') }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(coupon.code)).toBeVisible();
  await expect(
    page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.removeCouponCode') }),
  ).toBeVisible();
});

test('Invalid coupon code cannot be applied', async ({ page, catalog }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();
  await page.waitForLoadState('networkidle');
  await page.goto('/cart');

  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  await page
    .getByLabel(t('Cart.CheckoutSummary.CouponCode.couponCode'))
    .fill('some-invalid-coupon-code');

  await page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.apply') }).click();
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByText(t('Cart.CheckoutSummary.CouponCode.invalidCouponCode')),
  ).toBeVisible();
});
