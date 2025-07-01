import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test('Wishlist details displays an empty state when no items are in the wishlist', async ({
  page,
  customer,
}) => {
  const t = await getTranslations('Wishlist');
  const { id: customerId } = await customer.login();
  const { id, name } = await customer.createWishlist({ customerId });

  await page.goto(`/account/wishlists/${id}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(page.getByText(t('items', { count: 0 }))).toBeVisible();
  await expect(page.getByText(t('emptyWishlist'))).toBeVisible();
});

test('Wishlist details displays the wishlist actions bar and actions menu items correctly', async ({
  page,
  customer,
}) => {
  const t = await getTranslations('Wishlist');
  const { id: customerId } = await customer.login();
  const { id, name } = await customer.createWishlist({ customerId, isPublic: false });

  await page.goto(`/account/wishlists/${id}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  await expect(
    page.getByRole('switch', { name: `${t('Visibility.public')} ${t('Visibility.private')}` }),
  ).toBeVisible();
  await expect(page.getByLabel(t('Visibility.private'))).toBeVisible();
  await expect(page.getByRole('button', { name: t('share') })).toBeDisabled();

  await page.getByRole('button', { name: t('actionsTitle') }).click();
  await expect(page.getByRole('menuitem', { name: t('rename') })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: t('delete') })).toBeVisible();
});

test('Wishlist details displays a product correctly with "Add to Cart" button', async ({
  page,
  catalog,
  customer,
}) => {
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const t = await getTranslations();
  const { id: customerId } = await customer.login();
  const { id: wishlistId, name } = await customer.createWishlist({
    customerId,
    items: [
      {
        productId: product.id,
      },
    ],
  });

  await page.goto(`/account/wishlists/${wishlistId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: product.name })).toBeVisible();
  await expect(
    page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }),
  ).toBeVisible();
});

test('Wishlist product is able to be added to the cart', async ({ page, catalog, customer }) => {
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const t = await getTranslations();
  const { id: customerId } = await customer.login();
  const { id: wishlistId, name } = await customer.createWishlist({
    customerId,
    items: [
      {
        productId: product.id,
      },
    ],
  });

  await page.goto(`/account/wishlists/${wishlistId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: product.name })).toBeVisible();
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();
  await page.waitForLoadState('networkidle');

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const addToCartSuccessMessage = t.rich('Product.ProductDetails.successMessage', {
    cartItems: 1,
    cartLink: (chunks: React.ReactNode) => chunks,
  }) as string;

  await expect(page.getByText(addToCartSuccessMessage)).toBeVisible();
});

test('Wishlist product is able to be removed from the wishlist', async ({
  page,
  catalog,
  customer,
}) => {
  const product = await catalog.getDefaultOrCreateSimpleProduct();
  const t = await getTranslations();
  const { id: customerId } = await customer.login();
  const { id: wishlistId, name } = await customer.createWishlist({
    customerId,
    items: [
      {
        productId: product.id,
      },
    ],
  });

  await page.goto(`/account/wishlists/${wishlistId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: product.name })).toBeVisible();
  await page.getByRole('button', { name: t('Wishlist.removeButtonTitle') }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(t('Wishlist.Result.removeItemSuccess'))).toBeVisible();
  await expect(page.getByText(t('Wishlist.emptyWishlist'), { exact: true })).toBeVisible();
});

test('Wishlist details displays an out of stock product correctly', async ({
  page,
  catalog,
  customer,
}) => {
  const product = await catalog.createSimpleProduct({
    inventoryLevel: 0,
  });

  const t = await getTranslations();
  const { id: customerId } = await customer.login();
  const { id: wishlistId, name } = await customer.createWishlist({
    customerId,
    items: [
      {
        productId: product.id,
      },
    ],
  });

  await page.goto(`/account/wishlists/${wishlistId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: product.name })).toBeVisible();
  await expect(
    page.getByRole('button', { name: t('Product.ProductDetails.Submit.outOfStock') }),
  ).toBeDisabled();
});

test('Toggling wishlist visibility works as expected', async ({ page, customer }) => {
  const t = await getTranslations('Wishlist');
  const { id: customerId } = await customer.login();
  const { id: wishlistId, name } = await customer.createWishlist({
    customerId,
    isPublic: false,
  });

  await page.goto(`/account/wishlists/${wishlistId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

  await expect(page.getByLabel(t('Visibility.private'))).toBeVisible();
  await expect(page.getByRole('button', { name: t('share') })).toBeDisabled();

  await page.getByLabel(t('Visibility.private')).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByLabel(t('Visibility.public'))).toBeVisible();
  await expect(page.getByRole('button', { name: t('share') })).toBeEnabled();
});

test.describe('Wishlist details actions', () => {
  test(
    'Rename action renames the wishlist',
    { tag: [TAGS.writesData] },
    async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { id: wishlistId, name } = await customer.createWishlist({ customerId });

      await page.goto(`/account/wishlists/${wishlistId}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

      await page.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('rename') }).click();

      await expect(
        page.getByRole('heading', { name: t('Modal.renameTitle', { name }) }),
      ).toBeVisible();

      const newName = `${name} (renamed)`;

      await page.getByRole('textbox', { name: t('Form.nameLabel') }).fill(newName);
      await page.getByRole('button', { name: t('Modal.save') }).click();

      await expect(page.getByText(t('Result.updateSuccess'))).toBeVisible();
      await expect(page.getByRole('heading', { name })).toBeVisible();
    },
  );

  test(
    'Delete action deletes the wishlist',
    { tag: [TAGS.writesData] },
    async ({ page, customer }) => {
      const t = await getTranslations('Wishlist');
      const { id: customerId } = await customer.login();
      const { id: wishlistId, name } = await customer.createWishlist({ customerId });

      await page.goto(`/account/wishlists/${wishlistId}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();

      await page.getByRole('button', { name: t('actionsTitle') }).click();
      await page.getByRole('menuitem', { name: t('delete') }).click();
      await page.getByRole('button', { name: t('Modal.delete') }).click();

      await expect(page.getByText(t('Result.deleteSuccess'))).toBeVisible();
      await expect(page).toHaveURL('/account/wishlists/');
    },
  );
});
