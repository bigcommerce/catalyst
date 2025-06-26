import { expect, test } from '~/tests/fixtures';
import { getFormatter } from '~/tests/lib/formatter';
import { getTranslations } from '~/tests/lib/i18n';

test('Validate compare page', async ({ page, catalog, currency }) => {
  const format = getFormatter();
  const t = await getTranslations('Compare');
  const defaultCurrency = await currency.getDefaultCurrency();

  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const productWithVariants = await catalog.getDefaultOrCreateComplexProduct();

  await page.goto(`/compare/?ids=${product.id},${productWithVariants.id}`);
  await expect(page.getByRole('heading', { name: `${t('title')} 2` })).toBeVisible();

  // Products names
  await expect(page.getByText(product.name, { exact: true })).toBeVisible();
  await expect(page.getByText(productWithVariants.name, { exact: true })).toBeVisible();

  // Products CTAs
  await expect(page.getByRole('button', { name: t('addToCart') })).toBeVisible();
  await expect(page.getByRole('link', { name: t('viewOptions') })).toBeVisible();

  // Product prices
  const productPrice = format.number(product.price, {
    style: 'currency',
    currency: defaultCurrency,
  });

  const productWithVariantsPrice = format.number(productWithVariants.price, {
    style: 'currency',
    currency: defaultCurrency,
  });

  await expect(page.getByText(productPrice)).toBeVisible();
  await expect(page.getByText(productWithVariantsPrice)).toBeVisible();
});

test('Validate compare page with alternate currency', async ({ page, catalog, currency }) => {
  const format = getFormatter();
  const defaultCurrency = await currency.getDefaultCurrency();
  const alternateCurrency = (await currency.getEnabledCurrencies()).find(
    (c) => c !== defaultCurrency,
  );

  if (!alternateCurrency) {
    test.skip(true, 'No alternative currencies found.');

    return;
  }

  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const productWithVariants = await catalog.getDefaultOrCreateComplexProduct();

  await page.goto(`/compare/?ids=${product.id},${productWithVariants.id}`);
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByText(
      format.number(product.price, {
        style: 'currency',
        currency: defaultCurrency,
      }),
    ),
  ).toBeVisible();

  await currency.selectCurrency(alternateCurrency);

  const productPriceConverted = await currency.convertWithExchangeRate(
    alternateCurrency,
    product.price,
  );

  const formattedProductPrice = format.number(productPriceConverted, {
    style: 'currency',
    currency: alternateCurrency,
  });

  await expect(page.getByText(formattedProductPrice)).toBeVisible();

  const productWithVariantsPriceConverted = await currency.convertWithExchangeRate(
    alternateCurrency,
    productWithVariants.price,
  );

  const formattedProductWithVariantsPrice = format.number(productWithVariantsPriceConverted, {
    style: 'currency',
    currency: alternateCurrency,
  });

  await expect(page.getByText(formattedProductWithVariantsPrice)).toBeVisible();
});

test('Can add simple product to cart', async ({ page, catalog }) => {
  const t = await getTranslations('Compare');

  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(`/compare/?ids=${product.id}`);

  await page.getByRole('button', { name: t('addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('successMessage', {
    cartItems: 1,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();
});

test("Product with variants 'View options' redirect to product page", async ({ page, catalog }) => {
  const product = await catalog.getDefaultOrCreateComplexProduct();

  await page.goto(`/compare/?ids=${product.id}`);
  await page.getByRole('link', { name: 'View options' }).click();

  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
});

test('Disabled add to cart for out of stock products', async ({ page, catalog }) => {
  const t = await getTranslations('Compare');

  const product = await catalog.createSimpleProduct({
    inventoryTracking: 'product',
    inventoryLevel: 0,
  });

  const productWithVariants = await catalog.createComplexProduct({
    inventoryTracking: 'product',
    inventoryLevel: 0,
  });

  await page.goto(`/compare/?ids=${product.id},${productWithVariants.id}`);

  // Simple products should have the add to cart button disabled
  await expect(page.getByRole('button', { name: t('addToCart') })).toBeDisabled();
  // Product with variants should have the view options link even when OOS
  await expect(page.getByRole('link', { name: t('viewOptions') })).toBeVisible();
});

test('Show empty state when no products are selected', async ({ page }) => {
  const t = await getTranslations('Compare');

  await page.goto('/compare');

  await expect(page.getByText(t('noProductsToCompare'))).toBeVisible();
});
