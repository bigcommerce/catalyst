import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

test('badge', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/badge--docs');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByRole('heading', { name: 'Badge' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('badge zoomed', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/badge--docs');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByRole('heading', { name: 'Badge' })).toBeVisible();
    await page.frameLocator(storyBookElements.storyBookFrame).getByRole('button', { name: 'Zoom in' }).click();
    await expect(page).toHaveScreenshot();
});
