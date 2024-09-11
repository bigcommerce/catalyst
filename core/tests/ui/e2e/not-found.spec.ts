import { expect, test } from '@playwright/test';

test('404 page', async ({ page }) => {
  await page.goto('/unknown-url');

  await expect(page.getByRole('heading', { name: "We couldn't find that page!" })).toBeVisible();
});
