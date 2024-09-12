import { expect, test } from '~/tests/fixtures';

test('Verify breadcrumbs on product selection', async ({ page }) => {
  await page.goto('/kitchen/knives/most-popular/');

  const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });

  await expect(breadcrumbs.getByRole('link', { name: 'Kitchen' })).toBeVisible();
  await expect(breadcrumbs.getByRole('link', { name: 'Knives' })).toBeVisible();
  await expect(breadcrumbs.getByRole('link', { name: 'Most popular' })).toBeVisible();
});
