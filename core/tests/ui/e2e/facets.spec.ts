import { expect, Page, test } from '~/tests/fixtures';

// Test constants
const SHOP_ALL_URL = '/shop-all/';
const SHOP_ALL_HEADING_PATTERN = /Shop All/;

// Filter names
const FILTER_COLOR = 'Color';
const FILTER_BRAND = 'Brand';

// Filter values
const COLOR_BLUE = 'Blue';
const BRAND_OFS = 'OFS';

// Product names
const PRODUCT_LE_PARFAIT_JAR = '[Sample] 1 L Le Parfait Jar';
const PRODUCT_DUSTPAN_BRUSH = '[Sample] Dustpan & Brush';
const PRODUCT_UTILITY_CADDY = '[Sample] Utility Caddy';

// Button labels
const BUTTON_RESET_FILTERS = 'Reset filters';

// URL parameter names
const URL_PARAM_ATTR_COLOR = 'attr_Color';
const URL_PARAM_BRAND = 'brand';

// Expected counts
const EXPECTED_OFS_BRAND_COUNT = 5;
const EXPECTED_INITIAL_PRODUCT_COUNT = 13;

function extractNumber(text: string | null): number {
  if (!text) {
    return 0;
  }

  const regex = /\d+/;
  const match = regex.exec(text);

  return match ? parseInt(match[0] || '0', 10) : 0;
}

async function expandFilterIfNeeded(page: Page, filterLabel: string) {
  const filterButton = page.getByRole('button', { name: filterLabel }).first();
  const isExpanded = await filterButton.getAttribute('aria-expanded');

  if (isExpanded === 'false') {
    await filterButton.click();
  }
}

async function clickSpecificFilterOption(
  page: Page,
  filterName: string,
  optionName: string,
): Promise<boolean> {
  await expandFilterIfNeeded(page, filterName);

  const filterButton = page.getByRole('button', { name: filterName }).first();
  const accordionItem = filterButton.locator('xpath=ancestor::*[@data-state]').first();
  const contentRegion = accordionItem.locator('[role="region"]').first();

  await expect(contentRegion).toBeVisible();

  const buttons = contentRegion.locator('button[aria-label]');

  const count = await buttons.count();

  // Avoid await in loop by collecting all button data first
  const buttonData = await Promise.all(
    Array.from({ length: count }, async (_, index) => {
      const button = buttons.nth(index);
      const [ariaLabel, buttonText, isDisabled, hasDataDisabled] = await Promise.all([
        button.getAttribute('aria-label').catch(() => null),
        button.textContent().catch(() => null),
        button.isDisabled().catch(() => false),
        button.getAttribute('data-disabled').catch(() => null),
      ]);

      return { button, ariaLabel, buttonText, isDisabled, hasDataDisabled };
    }),
  );

  const matchingButton = buttonData.find(
    ({ ariaLabel, buttonText, isDisabled, hasDataDisabled }) => {
      const matchesLabel = ariaLabel?.includes(optionName);
      const matchesText = buttonText?.includes(optionName);

      return !isDisabled && !hasDataDisabled && (matchesLabel || matchesText);
    },
  );

  if (matchingButton) {
    await matchingButton.button.click();
    await page.waitForLoadState('networkidle');

    return true;
  }

  return false;
}

test('Blue color filter shows expected product on shop-all page', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await page.waitForLoadState('networkidle');

  const filterApplied = await clickSpecificFilterOption(page, FILTER_COLOR, COLOR_BLUE);

  expect(filterApplied).toBeTruthy();
  expect(new URL(page.url()).searchParams.get(URL_PARAM_ATTR_COLOR)).toBe(COLOR_BLUE);

  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});

test('Brand filter shows correct products', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await page.waitForLoadState('networkidle');

  const heading = page.getByRole('heading', { name: SHOP_ALL_HEADING_PATTERN });
  const initialCountText = await heading.textContent();
  const initialCount = extractNumber(initialCountText);

  const filterApplied = await clickSpecificFilterOption(page, FILTER_BRAND, BRAND_OFS);

  expect(filterApplied).toBeTruthy();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).searchParams.has(URL_PARAM_BRAND)).toBeTruthy();

  await expect(heading).toContainText(String(EXPECTED_OFS_BRAND_COUNT));

  const filteredCountText = await heading.textContent();
  const filteredCount = extractNumber(filteredCountText);

  expect(filteredCount).toBeLessThan(initialCount);
  expect(filteredCount).toBe(EXPECTED_OFS_BRAND_COUNT);

  await expect(page.getByRole('link', { name: PRODUCT_DUSTPAN_BRUSH })).toBeVisible();
  await expect(page.getByRole('link', { name: PRODUCT_UTILITY_CADDY })).toBeVisible();
  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});

test('Multiple filters work together (Color + Brand)', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await page.waitForLoadState('networkidle');

  const heading = page.getByRole('heading', { name: SHOP_ALL_HEADING_PATTERN });
  const initialCountText = await heading.textContent();
  const initialCount = extractNumber(initialCountText);

  const colorFilterApplied = await clickSpecificFilterOption(page, FILTER_COLOR, COLOR_BLUE);

  expect(colorFilterApplied).toBeTruthy();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).searchParams.get(URL_PARAM_ATTR_COLOR)).toBe(COLOR_BLUE);

  await expect(heading).not.toContainText(String(initialCount));

  const afterColorCountText = await heading.textContent();
  const afterColorCount = extractNumber(afterColorCountText);

  expect(afterColorCount).toBeLessThan(initialCount);

  const brandFilterApplied = await clickSpecificFilterOption(page, FILTER_BRAND, BRAND_OFS);

  expect(brandFilterApplied).toBeTruthy();

  await page.waitForLoadState('networkidle');

  const urlParams = new URL(page.url()).searchParams;

  expect(urlParams.get(URL_PARAM_ATTR_COLOR)).toBe(COLOR_BLUE);
  expect(urlParams.has(URL_PARAM_BRAND)).toBeTruthy();

  const afterBothCountText = await heading.textContent();
  const afterBothCount = extractNumber(afterBothCountText);

  expect(afterBothCount).toBeLessThanOrEqual(afterColorCount);

  await expect(page.getByRole('link', { name: PRODUCT_LE_PARFAIT_JAR })).toBeVisible();
});

test('Removing filter restores product list', async ({ page }) => {
  await page.goto(SHOP_ALL_URL);
  await page.waitForLoadState('networkidle');

  const heading = page.getByRole('heading', { name: SHOP_ALL_HEADING_PATTERN });
  const initialCountText = await heading.textContent();
  const initialCount = extractNumber(initialCountText);

  const filterApplied = await clickSpecificFilterOption(page, FILTER_BRAND, BRAND_OFS);

  expect(filterApplied).toBeTruthy();
  await page.waitForLoadState('networkidle');
  expect(new URL(page.url()).searchParams.has(URL_PARAM_BRAND)).toBeTruthy();

  await expect(heading).not.toContainText(String(initialCount));

  const filteredCountText = await heading.textContent();
  const filteredCount = extractNumber(filteredCountText);

  expect(filteredCount).toBeLessThan(initialCount);

  const resetButton = page.getByRole('button', { name: BUTTON_RESET_FILTERS });

  await resetButton.click();
  await page.waitForLoadState('networkidle');

  expect(new URL(page.url()).searchParams.has(URL_PARAM_BRAND)).toBeFalsy();

  await expect(heading).toContainText(String(EXPECTED_INITIAL_PRODUCT_COUNT));

  const restoredCountText = await heading.textContent();
  const restoredCount = extractNumber(restoredCountText);

  expect(restoredCount).toBe(initialCount);
});
