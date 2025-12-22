import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Homepage displays featured products section with title, description, and CTA', async ({
  page,
}) => {
  const t = await getTranslations('Home');

  await page.goto('/');

  await expect(page.getByRole('heading', { name: t('FeaturedProducts.title') })).toBeVisible();
  await expect(page.getByText(t('FeaturedProducts.description'))).toBeVisible();
  await expect(page.getByRole('link', { name: t('FeaturedProducts.cta') })).toBeVisible();
});

test('Homepage displays newest products carousel with title, description, and CTA', async ({
  page,
}) => {
  const t = await getTranslations('Home');

  await page.goto('/');

  await expect(page.getByRole('heading', { name: t('NewestProducts.title') })).toBeVisible();
  await expect(page.getByText(t('NewestProducts.description'))).toBeVisible();
  await expect(page.getByRole('link', { name: t('NewestProducts.cta') })).toBeVisible();
});

test('Featured products CTA link navigates to shop-all page', async ({ page }) => {
  const t = await getTranslations('Home');

  await page.goto('/');

  const ctaLink = page.getByRole('link', { name: t('FeaturedProducts.cta') });

  await expect(ctaLink).toBeVisible();
  await expect(ctaLink).toHaveAttribute('href', '/shop-all/');
});

test('Newest products CTA link navigates to shop-all page with sort parameter', async ({
  page,
}) => {
  const t = await getTranslations('Home');

  await page.goto('/');

  const ctaLink = page.getByRole('link', { name: t('NewestProducts.cta') });

  await expect(ctaLink).toBeVisible();
  await expect(ctaLink).toHaveAttribute('href', '/shop-all/?sort=newest');
});

test('Homepage displays products when available', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Check if any product links are visible (from either featured or newest sections)
  const productLinks = page.locator('a[href*="/product/"]');
  const count = await productLinks.count();

  if (count > 0) {
    await expect(productLinks.first()).toBeVisible();
  }
});

test('Homepage displays newsletter settings when enabled', async ({ page }) => {
  const t = await getTranslations('Components.Subscribe');

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();
  await expect(page.getByText(t('description'))).toBeVisible();
  await expect(page.getByPlaceholder(t('placeholder'))).toBeVisible();
});
