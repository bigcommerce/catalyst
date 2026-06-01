import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Valid coupon code can be applied to the cart', async ({ page, catalog, promotion }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const coupon = await promotion.createCouponCode();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();
  // The success toast auto-dismisses, so wait for the add-to-cart action to settle
  // and verify state on the /cart page.
  await page.waitForLoadState('networkidle');

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  // TODO: Remove retry pattern when root cause of next state issue is found/resolved [CATALYST-1685]
  // The apply button can get stuck spinning, and the optimistic update reverts if the
  // server action never completes. Retry from a clean reloaded state until the coupon
  // sticks or the timeout is hit.
  await expect(async () => {
    if (
      await page
        .getByText(coupon.code)
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    const couponInput = page.getByLabel(t('Cart.CheckoutSummary.CouponCode.couponCode'));

    if (!(await couponInput.isVisible().catch(() => false))) {
      await page.reload();
    }

    await couponInput.fill(coupon.code);
    await page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.apply') }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(coupon.code)).toBeVisible();
    await expect(
      page.getByRole('button', { name: t('Cart.CheckoutSummary.CouponCode.removeCouponCode') }),
    ).toBeVisible();
  }).toPass({ timeout: 30000 });
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
