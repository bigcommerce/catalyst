import { expect, Page } from '@playwright/test';

export async function viewCart(page: Page): Promise<void> {
  await expect(page.getByRole('link', { name: 'cart', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'cart', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your cart', exact: true })).toBeVisible();
}

export async function isItemPresentInCart(page: Page, productName: string): Promise<boolean> {
  return page.getByText(productName).first().isVisible();
}

export * as CartActions from './cart-actions';
