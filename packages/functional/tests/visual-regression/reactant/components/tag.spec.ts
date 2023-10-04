import { test, expect } from '@playwright/test';

const tagUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Tag basic example', async ({ page }) => {
    await page.goto(`${tagUrl}/tag--basic-example`);
    await expect(page.frameLocator(storyBookFrame).getByText('Tag')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Tag no action example', async ({ page }) => {
    await page.goto(`${tagUrl}/tag--no-action-example`);
    await expect(page.frameLocator(storyBookFrame).getByText('Tag')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
