import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Typing in the search bar displays quick search results', async ({ page, catalog }) => {
  const t = await getTranslations('Components.Header');
  const { name } = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto('/');
  await page.getByRole('button', { name: t('Icons.search') }).click();
  await page.getByPlaceholder(t('Search.inputPlaceholder')).fill(name);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: t('Search.categories') })).toBeVisible();
  await expect(page.getByRole('heading', { name: t('Search.brands') })).toBeVisible();
  await expect(page.getByRole('heading', { name: t('Search.products') })).toBeVisible();

  const searchResultLocator = page.getByRole('region', { name: t('Search.products') });

  await expect(searchResultLocator.getByRole('link', { name })).toBeVisible();
});

test('Typing in the search bar and pressing Enter goes to the Search Results page', async ({
  page,
  catalog,
}) => {
  const t = await getTranslations();
  const { name } = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto('/');
  await page.getByRole('button', { name: t('Components.Header.Icons.search') }).click();

  const searchInput = page.getByPlaceholder(t('Components.Header.Search.inputPlaceholder'));

  await searchInput.fill(name);
  await searchInput.press('Enter');
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('heading', { name: t('Faceted.Search.searchResults') }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name })).toBeVisible();
});

test('Searching by SKU returns the product in the search results', async ({ page, catalog }) => {
  const t = await getTranslations('Components.Header');
  const { name, sku } = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto('/');
  await page.getByRole('button', { name: t('Icons.search') }).click();
  await page.getByPlaceholder(t('Search.inputPlaceholder')).fill(sku);
  await page.waitForLoadState('networkidle');

  const searchResultLocator = page.getByRole('region', { name: t('Search.products') });

  await expect(searchResultLocator.getByRole('link', { name })).toBeVisible();
});

test('Searching for non-existent product displays no results', async ({ page }) => {
  const t = await getTranslations();
  const randomSearchTerm = faker.string.alphanumeric(10);

  await page.goto('/');
  await page.getByRole('button', { name: t('Components.Header.Icons.search') }).click();
  await page
    .getByPlaceholder(t('Components.Header.Search.inputPlaceholder'))
    .fill(randomSearchTerm);

  await page.waitForLoadState('networkidle');

  await expect(
    page.getByText(t('Components.Header.Search.noSearchResultsTitle', { term: randomSearchTerm })),
  ).toBeVisible();

  await expect(page.getByText(t('Components.Header.Search.noSearchResultsSubtitle'))).toBeVisible();
});

test('Searching for non-existent product displays no results on the Search Results page', async ({
  page,
}) => {
  const t = await getTranslations();

  await page.goto('/');
  await page.getByRole('button', { name: t('Components.Header.Icons.search') }).click();

  const searchInput = page.getByPlaceholder(t('Components.Header.Search.inputPlaceholder'));
  const randomSearchTerm = faker.string.alphanumeric(10);

  await searchInput.fill(randomSearchTerm);
  await searchInput.press('Enter');
  await page.waitForLoadState('networkidle');

  await expect(
    page.getByText(t('Faceted.Search.Empty.title', { term: randomSearchTerm })),
  ).toBeVisible();

  await expect(page.getByText(t('Faceted.Search.Empty.subtitle'))).toBeVisible();
});

test('Searching for a category displays in the search results', async ({ page, catalog }) => {
  const t = await getTranslations('Components.Header');
  const categories = await catalog.getCategories();
  const category = categories[0];

  if (!category) {
    test.skip(true, 'No categories found in the catalog');

    return;
  }

  const { name } = category;

  await page.goto('/');
  await page.getByRole('button', { name: t('Icons.search') }).click();

  await page.getByPlaceholder(t('Search.inputPlaceholder')).fill(name);
  await page.waitForLoadState('networkidle');

  const searchResultLocator = page.getByRole('region', { name: t('Search.categories') });

  await expect(searchResultLocator.getByRole('link', { name })).toBeVisible();
});

test('Searching for a brand displays in the search results', async ({ page, catalog }) => {
  const t = await getTranslations('Components.Header');
  const brands = await catalog.getBrands();
  const brand = brands[0];

  if (!brand) {
    test.skip(true, 'No brands found in the catalog');

    return;
  }

  const { name } = brand;

  await page.goto('/');
  await page.getByRole('button', { name: t('Icons.search') }).click();

  await page.getByPlaceholder(t('Search.inputPlaceholder')).fill(name);
  await page.waitForLoadState('networkidle');

  const searchResultLocator = page.getByRole('region', { name: t('Search.brands') });

  await expect(searchResultLocator.getByRole('link', { name })).toBeVisible();
});
