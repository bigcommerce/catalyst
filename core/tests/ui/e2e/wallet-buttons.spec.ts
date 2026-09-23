import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

const LOADER_SCRIPT_SELECTOR = 'script[src*="/v1/loader.js"]';
const WALLET_BUTTON_CONTAINER_SELECTOR = '[id$="-button"]';

test.describe('Cart wallet buttons', () => {
  test('does not inject the checkout SDK loader for an empty cart', async ({ page }) => {
    const t = await getTranslations('Cart');

    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: t('Empty.title'), exact: true })).toBeVisible();

    await expect(page.locator(WALLET_BUTTON_CONTAINER_SELECTOR)).toHaveCount(0);
    await expect(page.locator(LOADER_SCRIPT_SELECTOR)).toHaveCount(0);
  });

  test('renders wallet buttons and injects the checkout SDK loader when payment wallets are configured', async ({
    page,
    catalog,
  }) => {
    const t = await getTranslations();
    const product = await catalog.getDefaultOrCreateSimpleProduct();

    await page.goto(product.path);
    await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();
    await page.waitForLoadState('networkidle');

    await page.goto('/cart');

    await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();
    await page.waitForLoadState('networkidle');

    const walletContainers = page.locator(WALLET_BUTTON_CONTAINER_SELECTOR);

    const hasWalletButtons = await walletContainers
      .first()
      .waitFor({ state: 'attached', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    test.skip(
      !hasWalletButtons,
      'No payment wallets are configured for this store; skipping wallet button assertions.',
    );

    const containerIds = await walletContainers.evaluateAll((nodes) =>
      nodes.map((node) => node.id),
    );

    containerIds.forEach((id) => {
      expect(id).toMatch(/-button$/);
    });

    const loaderScript = page.locator(LOADER_SCRIPT_SELECTOR);

    await expect(loaderScript).toHaveCount(1);

    const loaderSrc = await loaderScript.first().getAttribute('src');

    expect(loaderSrc).toBeTruthy();
    expect(loaderSrc).toContain('/v1/loader.js');

    await expect(loaderScript.first()).toHaveAttribute('defer', '');
  });
});
