import { test, expect } from '@playwright/test';

const carouselUrl = 'https://catalyst-storybook.vercel.app/?path=/docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const docsSlides = '#story--carousel--multiple-slides--primary-inner';

test('Docs', async ({ page }) => {
    await page.goto(`${carouselUrl}/carousel--docs`);
    await expect(page.frameLocator(storyBookFrame).locator(docsSlides).getByRole('heading', { name: 'Related Products' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Multiple slides', async ({ page }) => {
    await page.goto(`${carouselUrl}/carousel--multiple-slides`);
    await expect(page.frameLocator(storyBookFrame).getByLabel('Related Products')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Single slide', async ({ page }) => {
    await page.goto(`${carouselUrl}/carousel--single-slide`);
    await expect(page.frameLocator(storyBookFrame).getByLabel('Related Products')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
