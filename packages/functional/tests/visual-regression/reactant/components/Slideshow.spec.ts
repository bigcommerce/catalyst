import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

test('Multiple slides', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/slideshow--multiple-slides');
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Pause slideshow')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Single slide', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/slideshow--single-slide');
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await expect(page.frameLocator(storyBookElements.storyBookFrame).getByRole('link', { name: 'Shop now' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Custom controls and interval', async ({ page }) => {
    await page.goto(storyBookElements.storyUrl + '/slideshow--custom-controls-and-interval');
    await page.getByRole('button', { name: 'Go full screen [F]' }).click();
    await page.frameLocator(storyBookElements.storyBookFrame).getByLabel('Pause slideshow').click();
    await expect(page).toHaveScreenshot();
});
