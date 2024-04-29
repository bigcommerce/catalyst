import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('Input with placeholder', async ({ page }) => {
  await page.goto(routes.SAMPLE_ABLE_BREWING_SYSTEM);
  await expect(
    page.getByRole('heading', { level: 1, name: '[Sample] Able Brewing System' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await expect(page.getByText('Shipping cost')).toBeVisible();
  await page.getByRole('button', { name: 'Add' }).first().click();
  await expect(page.getByLabel('Suburb/city')).toBeVisible();

  await expect(page.getByLabel('Suburb/city')).toHaveScreenshot();
});

test('Input error state', async ({ page }) => {
  await page.goto(routes.CONTACT_US);
  await expect(page.getByRole('button', { name: 'Submit form' })).toBeVisible();
  await page.getByRole('button', { name: 'Submit form' }).click();

  expect(await page.getByLabel('EmailRequired').screenshot()).toMatchSnapshot();
});
