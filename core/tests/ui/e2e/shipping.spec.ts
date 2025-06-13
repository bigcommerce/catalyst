import { faker } from '@faker-js/faker';

import { expect, Page, test } from '~/tests/fixtures';
import { CatalogFixture } from '~/tests/fixtures/catalog';
import { getTranslations } from '~/tests/lib/i18n';

async function addProductAndGoToCart(page: Page, catalog: CatalogFixture) {
  const t = await getTranslations();
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.getByRole('button', { name: t('Product.ProductDetails.Submit.addToCart') }).click();
  await page.waitForLoadState('networkidle');

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: t('Cart.title') })).toBeVisible();
}

async function fillOutShippingForm(page: Page) {
  const t = await getTranslations('Cart.CheckoutSummary.Shipping');

  await page.getByLabel(t('country')).click();
  await page.getByRole('option').first().click();
  await page.getByLabel(t('city')).fill(faker.location.city());
  await page.getByLabel(t('state')).click();

  const states = await page.getByRole('option').allTextContents();

  if (states.length >= 1) {
    // Click a random state
    const randomIndex = Math.floor(Math.random() * states.length);

    await page.getByRole('option').nth(randomIndex).click();
  } else {
    await page.keyboard.press('Escape');
  }

  await page.getByLabel(t('postalCode')).click();
  await page.getByLabel(t('postalCode')).fill(faker.location.zipCode('#####'));
}

async function selectRandomShippingOption(page: Page): Promise<string> {
  const shippingOptions = await page.getByRole('radio').all();

  let selectedOption = '';

  if (shippingOptions.length >= 1) {
    // Click a random state
    const randomIndex = Math.floor(Math.random() * shippingOptions.length);
    const shippingOption = shippingOptions[randomIndex];

    selectedOption =
      (await shippingOption?.locator('~ label > span[id*="label"]').innerText()) ?? '';

    await shippingOption?.click();
  }

  return selectedOption;
}

test('Add shipping estimates', async ({ page, catalog }) => {
  const t = await getTranslations('Cart.CheckoutSummary.Shipping');

  await addProductAndGoToCart(page, catalog);

  await page.getByRole('button', { name: t('add'), exact: true }).click();

  await fillOutShippingForm(page);

  await page.getByRole('button', { name: t('viewShippingOptions') }).click();
  await expect(page.getByLabel(t('shippingOptions'))).toBeVisible();

  const selectedOption = await selectRandomShippingOption(page);

  await page.getByRole('button', { name: t('addShipping') }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByText(`${selectedOption}${t('change')}`)).toBeVisible();
});

test('Update shipping estimates', async ({ page, catalog }) => {
  const t = await getTranslations('Cart.CheckoutSummary.Shipping');

  await addProductAndGoToCart(page, catalog);

  await page.getByRole('button', { name: t('add'), exact: true }).click();

  await fillOutShippingForm(page);

  await page.getByRole('button', { name: t('viewShippingOptions') }).click();
  await expect(page.getByLabel(t('shippingOptions'))).toBeVisible();

  let selectedOption = await selectRandomShippingOption(page);

  await page.getByRole('button', { name: t('addShipping') }).click();
  await page.waitForLoadState('networkidle');

  await page.getByText(t('change')).click();
  await page.getByRole('button', { name: t('editAddress') }).click();

  await fillOutShippingForm(page);

  await page.getByRole('button', { name: t('updatedShippingOptions') }).click();
  await expect(page.getByRole('button', { name: t('updatedShippingOptions') })).toBeHidden();

  if (await page.getByLabel(t('shippingOptions')).isVisible()) {
    selectedOption = await selectRandomShippingOption(page);
    await page.getByRole('button', { name: t('updateShipping') }).click();
    await page.waitForLoadState('networkidle');
  }

  await expect(page.getByText(`${selectedOption}${t('change')}`)).toBeVisible();
});

test('Updating cart quantity with a shipping estimate opens the shipping options for a new quote', async ({
  page,
  catalog,
}) => {
  const t = await getTranslations('Cart');

  await addProductAndGoToCart(page, catalog);

  await page.getByRole('button', { name: t('CheckoutSummary.Shipping.add'), exact: true }).click();

  await fillOutShippingForm(page);

  await page
    .getByRole('button', { name: t('CheckoutSummary.Shipping.viewShippingOptions') })
    .click();
  await expect(page.getByLabel(t('CheckoutSummary.Shipping.shippingOptions'))).toBeVisible();

  let selectedOption = await selectRandomShippingOption(page);

  await page.getByRole('button', { name: t('CheckoutSummary.Shipping.addShipping') }).click();
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByText(`${selectedOption}${t('CheckoutSummary.Shipping.change')}`),
  ).toBeVisible();

  await page.getByLabel(t('increment')).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByLabel(t('CheckoutSummary.Shipping.shippingOptions'))).toBeVisible();

  selectedOption = await selectRandomShippingOption(page);

  await page.getByRole('button', { name: t('CheckoutSummary.Shipping.addShipping') }).click();
  await expect(
    page.getByText(`${selectedOption}${t('CheckoutSummary.Shipping.change')}`),
  ).toBeVisible();
});
