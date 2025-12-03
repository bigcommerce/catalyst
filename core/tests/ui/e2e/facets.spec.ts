import { expect, Page, test } from '~/tests/fixtures';

const SHOP_ALL_URL = '/shop-all/';

const PRODUCT_LE_PARFAIT_JAR = '[Sample] 1 L Le Parfait Jar';
const PRODUCT_DUSTPAN_BRUSH = '[Sample] Dustpan & Brush';
const PRODUCT_UTILITY_CADDY = '[Sample] Utility Caddy';

async function expandFilterIfNeeded(page: Page, filterLabel: string) {
  const filterButton = page
    .getByRole('heading', { name: filterLabel, level: 3 })
    .getByRole('button', { name: filterLabel });

  const isExpanded = await filterButton.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    await filterButton.click();
  }
}

async function clickSpecificFilterOption(page: Page, filterName: string, optionName: string) {
  const filterButton = page
    .getByRole('region', { name: filterName })
    .getByRole('button', { name: optionName, disabled: false });

  await filterButton.click();
}

test('Blue color filter shows expected product on shop-all page', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();

  await expandFilterIfNeeded(page, 'Color');
  await clickSpecificFilterOption(page, 'Color', 'Blue');

  await expect(page).toHaveURL((url) => url.searchParams.get('attr_Color') === 'Blue');
  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});

test('Brand filter shows correct products', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();

  await expandFilterIfNeeded(page, 'Brand');
  await clickSpecificFilterOption(page, 'Brand', 'OFS');

  await expect(page).toHaveURL((url) => url.searchParams.has('brand'));
  await expect(page.getByRole('heading', { name: 'Shop All 5' })).toBeVisible();
  await expect(page.getByRole('link', { name: PRODUCT_DUSTPAN_BRUSH })).toBeVisible();
  await expect(page.getByRole('link', { name: PRODUCT_UTILITY_CADDY })).toBeVisible();
  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});

test('Multiple filters work together (Color + Brand)', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();

  await expandFilterIfNeeded(page, 'Color');
  await clickSpecificFilterOption(page, 'Color', 'Blue');

  await expect(page).toHaveURL((url) => url.searchParams.get('attr_Color') === 'Blue');

  await expandFilterIfNeeded(page, 'Brand');
  await clickSpecificFilterOption(page, 'Brand', 'OFS');

  await expect(page).toHaveURL((url) => {
    const params = url.searchParams;

    return params.get('attr_Color') === 'Blue' && params.has('brand');
  });
  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});

test('Removing filter restores product list', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();

  await expandFilterIfNeeded(page, 'Brand');
  await clickSpecificFilterOption(page, 'Brand', 'OFS');

  await expect(page).toHaveURL((url) => url.searchParams.has('brand'));
  await expect(page.getByRole('heading', { name: 'Shop All 5' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset filters' }).click();

  await expect(page).toHaveURL((url) => !url.searchParams.has('brand'));
  await expect(page.getByRole('heading', { name: 'Shop All 13' })).toBeVisible();
});
