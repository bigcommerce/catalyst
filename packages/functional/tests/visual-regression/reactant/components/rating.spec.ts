import { test, expect } from '@playwright/test';

const ratingUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const storyBook = '#storybook-root';

test('Five star rating', async ({ page }) => {
    await page.goto(`${ratingUrl}/rating--five-star-rating`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Zero rating', async ({ page }) => {
    await page.goto(`${ratingUrl}/rating--zero-rating`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Float rating', async ({ page }) => {
    await page.goto(`${ratingUrl}/rating--float-rating`);
    await expect(page.frameLocator(storyBookFrame).locator(storyBook)).toBeVisible();
    await expect(page).toHaveScreenshot();
});


