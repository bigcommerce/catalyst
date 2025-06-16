import { expect, test } from '~/tests/fixtures';
import { getFormatter } from '~/tests/lib/formatter';
import { getTranslations } from '~/tests/lib/i18n';

test('Cart page displays empty state when no items are in the cart', async ({ page }) => {
  const t = await getTranslations('Cart');

  await page.goto('/cart');

  await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();
  await expect(page.getByText(t('Empty.title'))).toBeVisible();
  await expect(page.getByText(t('Empty.subtitle'))).toBeVisible();
  await expect(page.getByRole('link', { name: t('Empty.cta') })).toBeVisible();
});

test('Cart page displays line item', async ({ page, catalog, currency }) => {
  const format = getFormatter();
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

  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();
  await expect(page.getByRole('heading', { name: t('Cart.CheckoutSummary.title') })).toBeVisible();

  const lineItem = page.getByRole('listitem').filter({ hasText: product.name });
  const formattedPrice = format.number(product.price, {
    style: 'currency',
    currency: await currency.getDefaultCurrency(),
  });

  await expect(lineItem.getByText(formattedPrice)).toBeVisible();
});

test('Cart page allows updating item quantity', async ({ page, catalog }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  if (product.inventoryLevel === 0 && product.inventoryTracking !== 'none') {
    test.skip(
      true,
      'Product is out of stock, skipping test. This means that the DEFAULT_PRODUCT_ID points to an out of stock product.',
    );
  }

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('Product.ProductDetails.successMessage', {
    cartItems: 1,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: `${t('Cart.title')}1` })).toBeVisible();

  await page.getByLabel(t('Cart.increment')).click();
  await expect(page.getByRole('heading', { name: `${t('Cart.title')}2` })).toBeVisible();
});

test('Cart page allows removing a line item', async ({ page, catalog }) => {
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
  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  await page.getByRole('button', { name: t('Cart.removeItem') }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: t('Cart.Empty.title') })).toBeVisible();
});

test('Cart page can proceed to checkout', async ({ page, catalog }) => {
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
  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();

  await page.getByRole('button', { name: t('Cart.proceedToCheckout') }).click();
  await page.waitForURL('**/checkout', {
    waitUntil: 'networkidle',
  });
});
