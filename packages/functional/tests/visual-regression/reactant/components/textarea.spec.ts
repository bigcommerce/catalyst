import { test, expect } from '@playwright/test';

const textAreaUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Text area default', async ({ page }) => {
    await page.goto(`${textAreaUrl}/textarea--default`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Text area success', async ({ page }) => {
    await page.goto(`${textAreaUrl}/textarea--success`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Text area error', async ({ page }) => {
    await page.goto(`${textAreaUrl}/textarea--error`);
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookFrame).getByPlaceholder('Placeholder...')).toBeVisible();
    await expect(page).toHaveScreenshot();
});
