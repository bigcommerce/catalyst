import { Page } from '@playwright/test';

export async function searchForProduct(page: Page, productName: string) {
  await page.getByLabel('Open search popup').click();
  await page.getByRole('dialog', { name: 'Search bar' }).isVisible();
  await page.getByPlaceholder('Search...').fill(productName);
  await page.getByPlaceholder('Search...').press('Enter');
  await page.getByRole('link').filter({ hasText: productName }).isVisible();
}

export * as SearchActions from './search-actions';
