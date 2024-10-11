import { expect, Page, test } from '~/tests/fixtures';

async function addEstimatedShippingCosts(
  page: Page,
  country: string,
  state: string,
  city: string,
  zip: string,
): Promise<void> {
  await page.getByRole('combobox', { name: 'Country' }).click();
  await page.getByLabel(country).click();

  await page.getByRole('combobox', { name: 'State/province' }).click();
  await page.getByLabel(state).click();

  await page.getByLabel('Suburb/city').fill(city);
  await page.getByLabel('Zip/Postcode').fill(zip);

  await page.getByRole('button', { name: 'Estimate shipping' }).click();
  await page.getByRole('button', { name: 'Update shipping costs' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/sample-able-brewing-system/');
  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('button', { name: 'Add to Cart' }).first().isEnabled();
  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByText('[Sample] Able Brewing System', { exact: true })).toBeVisible();
});

test('Add shipping estimates', async ({ page }) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await addEstimatedShippingCosts(page, 'United States', 'Texas', 'Austin', '76267');
  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
});

test('Update shipping estimates', async ({ page }) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await addEstimatedShippingCosts(page, 'United States', 'Texas', 'Austin', '76267');

  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
  await page.getByRole('button', { name: 'Change' }).click();

  await addEstimatedShippingCosts(page, 'United States', 'Massachusetts', 'Boston', '01762');

  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
});

test('Add shipping estimates for Canada', async ({ page }) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await addEstimatedShippingCosts(page, 'Canada', 'British Columbia', 'Vancouver', '98617');
  await expect(page.getByRole('button', { name: 'Change' })).toBeVisible();
});

/**
 * @description When the item in cart is modified after shipping estimation is calculated, shipping estimation
 * is reset but shipping information is persisted.
 */
test('Updating cart items should reset shipping costs but retain shipping information', async ({
  page,
}) => {
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();

  await addEstimatedShippingCosts(page, 'United States', 'Texas', 'Austin', '76267');
  await page.getByRole('button', { name: 'Change' }).waitFor();

  await page.getByRole('button', { name: 'Increase count' }).click();
  await page.getByRole('link', { name: 'Cart Items 2' }).waitFor();

  await page.getByRole('button', { name: 'Add' }).first().click();

  await expect(
    page.getByRole('combobox', { name: 'Country' }).filter({ hasText: 'United States' }),
  ).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'State/province' }).filter({ hasText: 'Texas' }),
  ).toBeVisible();
  await expect(page.getByPlaceholder('City')).toHaveValue('Austin');
  await expect(page.getByPlaceholder('Postal code')).toHaveValue('76267');
});
