/* eslint-disable no-console */
import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test(
  'PDP shows backorder availability and cart shows backorder details',
  { tag: [TAGS.writesData] },
  async ({ page, catalog, settings, inventory }) => {
    test.setTimeout(180_000);

    const productT = await getTranslations('Product.ProductDetails');
    const cartT = await getTranslations('Cart');

    console.log('[backorder] Step 1: Setting inventory display settings');

    await settings.setInventorySettings({
      stockLevelDisplay: 'show',
      showBackorderAvailabilityPrompt: true,
      backorderAvailabilityPrompt: 'Available for backorder',
      showBackorderMessage: true,
      showQuantityOnBackorder: true,
      showQuantityOnHand: true,
    });
    console.log('[backorder] Step 1 complete');

    console.log('[backorder] Step 2: Creating product');

    const product = await catalog.createSimpleProduct({
      inventoryTracking: 'product',
      inventoryLevel: 2,
    });

    console.log(
      '[backorder] Step 2 complete: product id=%d path=%s variants=%j',
      product.id,
      product.path,
      product.variants,
    );

    console.log('[backorder] Step 3: Creating backorder message');

    const backorderMessage = await inventory.createBackorderMessage({
      message: 'Ships in 2-3 weeks',
    });

    console.log(
      '[backorder] Step 3 complete: message id=%s numericId=%d',
      backorderMessage.id,
      backorderMessage.numericId,
    );

    console.log('[backorder] Step 4: Configuring product backorder settings');

    await inventory.configureProductBackorder({
      productId: product.id,
      locationId: 1,
      backorderLimit: 10,
      backorderMessageId: backorderMessage.numericId,
    });
    console.log('[backorder] Step 4 complete');

    console.log('[backorder] Step 5: Waiting 61s for inventory projection pipeline');
    await new Promise((resolve) => setTimeout(resolve, 61_000));
    console.log('[backorder] Step 5 complete');

    console.log('[backorder] Step 6: Navigating to PDP at %s', product.path);
    await page.goto(product.path);
    await page.waitForLoadState('networkidle');
    console.log('[backorder] Step 6: Page loaded, checking assertions with retry');

    await expect(async () => {
      try {
        await expect(page.getByText(productT('currentStock', { quantity: 2 }))).toBeVisible();
        await expect(page.getByText('Available for backorder')).toBeVisible();
      } catch {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(productT('currentStock', { quantity: 2 }))).toBeVisible();
        await expect(page.getByText('Available for backorder')).toBeVisible();
      }
    }).toPass({ timeout: 90_000, intervals: [2_000] });
    console.log('[backorder] Step 6 complete: PDP assertions passed');

    console.log('[backorder] Step 7: Setting qty to 5');
    await page.getByRole('spinbutton', { name: productT('quantity') }).fill('5');
    await expect(page.getByText(productT('backorderQuantity', { quantity: 3 }))).toBeVisible();
    await expect(page.getByText('Ships in 2-3 weeks')).toBeVisible();
    console.log('[backorder] Step 7 complete');

    console.log('[backorder] Step 8: Adding to cart');
    await page.getByRole('button', { name: productT('Submit.addToCart') }).click();
    await expect(page.getByText(/added to/i).first()).toBeVisible();
    console.log('[backorder] Step 8 complete');

    console.log('[backorder] Step 9: Navigating to cart');
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(cartT('quantityReadyToShip', { quantity: 2 }))).toBeVisible();
    await expect(page.getByText(cartT('quantityOnBackorder', { quantity: 3 }))).toBeVisible();
    await expect(page.getByText('Ships in 2-3 weeks')).toBeVisible();
    console.log('[backorder] Step 9 complete: all assertions passed');
  },
);
