import { expect, test } from '~/tests/fixtures';

test('Tags', async ({ page }) => {
  await page.goto('/shop-all/?brand=37');

  const tag = page.getByLabel('Filters').getByRole('listitem').filter({ hasText: 'Common Good' });

  await tag.waitFor();

  await expect(tag).toHaveScreenshot();
});
