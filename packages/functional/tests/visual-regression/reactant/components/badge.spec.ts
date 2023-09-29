import { test, expect } from '@playwright/test';

const badgeUrl = 'http://localhost:6006/?path=/docs/badge--docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const collapseBtn = '#story--accordion--basic-example--primary-inner';

test('badge', async ({ page }) => {
    await page.goto(badgeUrl);
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Badge' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('badge zoomed', async ({ page }) => {
    await page.goto(badgeUrl);
    await expect(page.frameLocator(storyBookFrame).getByRole('heading', { name: 'Badge' })).toBeVisible();
    await page.frameLocator(storyBookFrame).getByRole('button', { name: 'Zoom in' }).click();
    await expect(page).toHaveScreenshot();
});
