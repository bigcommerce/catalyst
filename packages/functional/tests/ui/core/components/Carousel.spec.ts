import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('tablist', { name: 'Slides' })
    .scrollIntoViewIfNeeded();

  await page
    .getByRole('link', { name: '[Sample] Smith Journal 13' })
    .first()
    .scrollIntoViewIfNeeded();

  await expect(page.getByRole('link', { name: '[Sample] Smith Journal 13' }).first()).toBeVisible();
});

test('Navigate to next set of products', async ({ page }) => {
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(
    page.getByRole('link', { name: '[Sample] Tiered Wire Basket' }).first(),
  ).toBeVisible();
});

test('Navigate to previous set of products', async ({ page }) => {
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(
    page.getByRole('link', { name: '[Sample] Tiered Wire Basket' }).first(),
  ).toBeVisible();

  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('button', { name: 'Previous products' })
    .click();

  await expect(page.getByRole('link', { name: '[Sample] Smith Journal 13' }).first()).toBeVisible();
});

test('Navigation on set of products is cyclic', async ({ page }) => {
  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(
    page.getByRole('link', { name: '[Sample] Tiered Wire Basket' }).first(),
  ).toBeVisible();

  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(
    page.getByRole('link', { name: '[Sample] Able Brewing System' }).first(),
  ).toBeVisible();

  await page
    .getByRole('region')
    .filter({ has: page.getByRole('heading', { name: 'Featured products' }) })
    .getByRole('button', { name: 'Next products' })
    .click();

  await expect(page.getByRole('link', { name: '[Sample] Smith Journal 13' }).first()).toBeVisible();
});
