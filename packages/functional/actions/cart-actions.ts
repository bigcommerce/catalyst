import { Page } from '@playwright/test';

export async function addEstimatedShippingCosts(
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

export * as CartActions from './cart-actions';
