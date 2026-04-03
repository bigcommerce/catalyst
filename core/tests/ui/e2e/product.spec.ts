import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getFormatter } from '~/tests/lib/formatter';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test('Displays a simple product and can add it to the cart', async ({
  page,
  catalog,
  currency,
}) => {
  const t = await getTranslations('Product.ProductDetails');
  const format = getFormatter();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await expect(
    page.getByText(
      format.number(product.price, {
        style: 'currency',
        currency: await currency.getDefaultCurrency(),
      }),
    ),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: t('Submit.addToCart') })).toBeVisible();

  await page.getByRole('button', { name: t('Submit.addToCart') }).click();
});

test('Displays out of stock product correctly', async ({ page, catalog }) => {
  const t = await getTranslations('Product.ProductDetails');

  const product = await catalog.createSimpleProduct({
    inventoryTracking: 'product',
    inventoryLevel: 0,
  });

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await expect(page.getByRole('button', { name: t('Submit.outOfStock') })).toBeVisible();
});

test('Displays out of stock product correctly when out of stock message is enabled', async ({
  page,
  catalog,
  settings,
}) => {
  const t = await getTranslations('Product.ProductDetails');

  await settings.setInventorySettings({
    showOutOfStockMessage: true,
    defaultOutOfStockMessage: 'Currently out of stock',
  });

  const product = await catalog.createSimpleProduct({
    inventoryTracking: 'product',
    inventoryLevel: 0,
  });

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await expect(page.getByRole('button', { name: t('Submit.outOfStock') })).toBeVisible();
  await expect(page.getByText('Currently out of stock')).toBeVisible();
});

test('Displays current stock message when stock level message is enabled', async ({
  page,
  catalog,
  settings,
}) => {
  const t = await getTranslations('Product.ProductDetails');

  await settings.setInventorySettings({
    stockLevelDisplay: 'show',
  });

  const product = await catalog.createSimpleProduct({
    inventoryTracking: 'product',
    inventoryLevel: 10,
  });

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await expect(page.getByText(t('currentStock', { quantity: 10 }))).toBeVisible();
});

test('Displays product price correctly for an alternate currency', async ({
  page,
  catalog,
  currency,
}) => {
  const format = getFormatter();
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const defaultCurrency = await currency.getDefaultCurrency();
  const alternateCurrency = (await currency.getEnabledCurrencies()).find(
    (c) => c !== defaultCurrency,
  );

  if (!alternateCurrency) {
    test.skip(true, 'No alternative currencies found.');

    return;
  }

  await page.goto(product.path);
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

  const formatted = format.number(productPriceConverted, {
    style: 'currency',
    currency: alternateCurrency,
  });

  await expect(page.getByText(formatted)).toBeVisible();
});

test('Quantity buttons work and adds the correct amount to the cart', async ({ page, catalog }) => {
  const t = await getTranslations('Product.ProductDetails');
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await page.getByLabel(t('increaseQuantity')).click();
  await page.getByLabel(t('increaseQuantity')).click();
  await page.getByLabel(t('increaseQuantity')).click();
  await expect(page.getByRole('spinbutton', { name: t('quantity') })).toHaveValue('4');
  await page.getByLabel(t('decreaseQuantity')).click();
  await expect(page.getByRole('spinbutton', { name: t('quantity') })).toHaveValue('3');

  await page.getByRole('button', { name: t('Submit.addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('successMessage', {
    cartItems: 3,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();
});

test('Quantity input works and adds the correct amount to the cart', async ({ page, catalog }) => {
  const t = await getTranslations('Product.ProductDetails');
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');
  await page.getByRole('spinbutton', { name: t('quantity') }).fill('5');

  await page.getByRole('button', { name: t('Submit.addToCart') }).click();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('successMessage', {
    cartItems: 5,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();
});

test('Displays the wishlist button with default menu items', async ({ page, catalog }) => {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: t('Wishlist.Button.label') }).click();

  await expect(
    page.getByRole('menuitem', { name: t('Wishlist.Button.addToNewWishlist') }),
  ).toBeVisible();

  await expect(
    page.getByRole('menuitem', { name: t('Wishlist.Button.defaultWishlistName') }),
  ).toBeVisible();
});

test(
  'Adding to a new wishlist as a guest user redirects to login, and redirects back to PDP to finish adding to the new wishlist',
  { tag: [TAGS.writesData] },
  async ({ page, catalog, customer }) => {
    const t = await getTranslations();
    const { id: customerId, email, password } = await customer.getOrCreateTestCustomer();

    if (!password) {
      test.skip(true, 'No password set for the customer, skipping test.');

      return;
    }

    const product = await catalog.getDefaultOrCreateSimpleProduct();

    await page.goto(product.path);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: t('Wishlist.Button.label') }).click();
    await page.getByRole('menuitem', { name: t('Wishlist.Button.addToNewWishlist') }).click();
    await page.waitForLoadState('networkidle');

    await page.getByLabel(t('Auth.Login.email')).fill(email);
    await page.getByLabel(t('Auth.Login.password')).fill(password);
    await page.getByRole('button', { name: t('Auth.Login.cta') }).click();
    await page.waitForURL(`${product.path}?action=addToNewWishlist`);

    const wishlistName = `Wishlist ${faker.string.alpha(10)}`;

    await page.getByLabel(t('Wishlist.Form.nameLabel')).fill(wishlistName);
    await page.getByRole('button', { name: t('Wishlist.Modal.create') }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(t('Wishlist.Button.addSuccessMessage'))).toBeVisible();

    await customer.deleteAllWishlists(customerId);
  },
);

test(
  'Wishlist button adds to the default wishlist if a customer does not have any wishlists',
  { tag: [TAGS.writesData] },
  async ({ page, customer, catalog }) => {
    const t = await getTranslations();
    const { id: customerId } = await customer.login();

    // Ensure the customer has no wishlists before starting the test
    await customer.deleteAllWishlists(customerId);

    const product = await catalog.getDefaultOrCreateSimpleProduct();

    await page.goto(product.path);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: t('Wishlist.Button.label') }).click();
    await page.getByRole('menuitem', { name: t('Wishlist.Button.defaultWishlistName') }).click();

    await page.waitForLoadState('networkidle');

    await expect(page.getByText(t('Wishlist.Button.addSuccessMessage'))).toBeVisible();
  },
);

test(
  'Wishlist button adds the product to an existing wishlist',
  { tag: [TAGS.writesData] },
  async ({ page, customer, catalog }) => {
    const t = await getTranslations();
    const { id: customerId } = await customer.login();
    const { name } = await customer.createWishlist({ customerId });

    const product = await catalog.getDefaultOrCreateSimpleProduct();

    await page.goto(product.path);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: t('Wishlist.Button.label') }).click();
    await page.getByRole('menuitem', { name }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(t('Wishlist.Button.addSuccessMessage'))).toBeVisible();
  },
);
