import { test, expect } from '@playwright/test';

const messageUrl = 'https://catalyst-storybook.vercel.app/?path=/story';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';

test('Default message', async ({ page }) => {
    await page.goto(`${messageUrl}/message--default`);
    await expect(page.frameLocator(storyBookFrame).getByText('Here is your message for Users on Successful Action')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Error message', async ({ page }) => {
    await page.goto(`${messageUrl}/message--error`);
    await expect(page.frameLocator(storyBookFrame).getByText('Here is your message for Users on Failed Action')).toBeVisible();
    await expect(page).toHaveScreenshot();
});

