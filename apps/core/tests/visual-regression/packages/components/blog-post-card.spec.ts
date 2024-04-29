import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('blog post card', async ({ page }) => {
  await page.goto(routes.BLOG);
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Blog', exact: true }).locator('..'),
  ).toHaveScreenshot();
});
