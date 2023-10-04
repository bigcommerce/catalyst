import { test, expect } from '@playwright/test';

const slideShowUrl : string  = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Multiple slides', async ({ page }) => {
    await page.goto(`${slideShowUrl}/slideshow--multiple-slides`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByLabel('Pause slideshow')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Single slide', async ({ page }) => {
    await page.goto(`${slideShowUrl}/slideshow--single-slide`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByRole('link', { name: 'Shop now' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Custom controls and interval', async ({ page }) => {
    await page.goto(`${slideShowUrl}/slideshow--custom-controls-and-interval`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await page.frameLocator(storyBookFrame).getByLabel('Pause slideshow').click();
    await expect(page).toHaveScreenshot();
});
