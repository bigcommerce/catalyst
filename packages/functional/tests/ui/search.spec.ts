import { expect, test } from '@playwright/test';

import { SearchActions } from '../../actions/search-actions';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Open search popup')).toBeVisible();
});

test('Search for a product', async ({ page }) => {
  await SearchActions.searchForProduct(page, 'smith journal');
  await page.getByRole('link', { name: '[Sample] Smith Journal 13' }).click();
  await expect(page.getByRole('heading', { name: '[Sample] Smith Journal 13' })).toBeVisible();
});
