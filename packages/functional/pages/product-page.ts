import { expect, Page } from '@playwright/test';

export const PRODUCT_HEADING = '#product-heading';

export async function validateShopAllPage(page: Page) {
  await expect(page.getByRole('button', { name: 'Brand' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Brand' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Color' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Size' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Price', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rating' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Other' })).toBeVisible();
  await expect(page.getByLabel('Sort by:')).toBeVisible();
}

export * as ProductPage from './product-page';
