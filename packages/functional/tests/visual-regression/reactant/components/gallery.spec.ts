import { test, expect } from '@playwright/test';

const galleryUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Gallery example', async ({ page }) => {
    await page.goto(`${galleryUrl}/gallery--example`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByLabel('Thumbnail navigation')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Custom image gallery', async ({ page }) => {
    await page.goto(`${galleryUrl}/gallery--custom-image-element`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByLabel('Thumbnail navigation')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

