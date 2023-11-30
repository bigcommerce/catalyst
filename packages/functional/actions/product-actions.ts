import { expect, Page } from '@playwright/test';

export async function addProductToCart(page: Page, productName: string): Promise<void> {
  await page.getByRole('link', { name: productName }).click();
  await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
}

export async function isProductVisible(page: Page, productName: string): Promise<boolean> {
  return page.getByText(productName).isVisible();
}

export async function addProductsToCompare(page: Page, names: string[]) {
  // eslint-disable-next-line no-restricted-syntax,no-await-in-loop
  for (const name of names) await selectProductForComparison(page, name);
}

async function selectProductForComparison(page: Page, name: string) {
  await expect(
    page.locator('a').filter({ hasText: name }).locator('../..').locator('button'),
  ).toBeVisible();
  await page
    .locator('a')
    .filter({ hasText: name })
    .locator('../..')
    .locator('button')
    .scrollIntoViewIfNeeded();
  await page.locator('a').filter({ hasText: name }).locator('../..').locator('button').click();
}

export * as ProductActions from './product-actions';
