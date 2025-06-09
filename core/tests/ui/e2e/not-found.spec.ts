import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test.describe('Not Found Page', () => {
  test('Displays title, subtitle, and search button', async ({ page }) => {
    const t = await getTranslations();

    await page.goto('/unknown-url');

    await expect(page.getByRole('heading', { name: t('NotFound.title') })).toBeVisible();
    await expect(page.getByText(t('NotFound.subtitle'))).toBeVisible();
    await expect(
      page.getByRole('button', { name: t('Components.Header.Icons.search') }),
    ).toBeVisible();
  });

  test('Clicking the search button opens the search bar', async ({ page }) => {
    const t = await getTranslations('Components.Header');

    await page.goto('/unknown-url');

    await page.getByRole('button', { name: t('Icons.search') }).click();
    await expect(page.getByRole('textbox', { name: t('Search.inputPlaceholder') })).toBeVisible();
  });
});
