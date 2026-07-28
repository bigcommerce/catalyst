import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Valid coupon code can be applied to the cart', async ({ page, catalog, promotion }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const coupon = await promotion.createCouponCode();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('Product.ProductDetails.successMessage', {
    cartItems: 1,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();
  await page.goto('/cart');

  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  await page.getByLabel(t('Cart.CheckoutSummary.CouponCode.couponCode')).fill(coupon.code);
  await page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.apply') }).click();
  await page.waitForLoadState('networkidle');

  try {
    await expect(page.getByText(coupon.code)).toBeVisible();
    await expect(
      page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.removeCouponCode') }),
    ).toBeVisible();
  } catch {
    // TODO: Remove try/catch when root cause of next state issue is found/resolved [CATALYST-1685]
    // NextJS seems to have some issues when running local builds.
    // In this test, the coupon button will get stuck spinning forever and cause the assertions to fail.
    // This doesn't happen on deployed production builds, just local next builds.
    // To combat this, if the previous assertions fail, we hard refresh the page and then try again.
    await page.reload();
    await expect(page.getByText(coupon.code)).toBeVisible();
    await expect(
      page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.removeCouponCode') }),
    ).toBeVisible();

    // eslint-disable-next-line no-console
    console.warn('Coupon applied but page got stuck in loading state.');
  }
});

test('Invalid coupon code cannot be applied', async ({ page, catalog }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('Product.ProductDetails.successMessage', {
    cartItems: 1,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();
  await page.goto('/cart');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  await page
    .getByLabel(t('Cart.CheckoutSummary.CouponCode.couponCode'))
    .fill('some-invalid-coupon-code');

  await page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.apply') }).click();
  await page.waitForLoadState('networkidle');

  try {
    await expect(
      page.getByText(t('Cart.CheckoutSummary.CouponCode.invalidCouponCode')),
    ).toBeVisible();
  } catch {
    // TODO: Remove try/catch when root cause of next state issue is found/resolved [CATALYST-1685]
    await page.reload();
    await expect(
      page.getByText(t('Cart.CheckoutSummary.CouponCode.invalidCouponCode')),
    ).toBeVisible();
  }
});
