import { expect } from '@playwright/test';

import { test } from '~/tests/fixtures';

test('404 page', async ({ page }) => {
  await page.goto('/unknown-url');

  await expect(page.getByRole('heading', { name: "We couldn't find that page!" })).toBeVisible();
});
