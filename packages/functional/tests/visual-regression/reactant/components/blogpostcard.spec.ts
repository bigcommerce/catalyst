import { test, expect } from '@playwright/test';

const badgeUrl = 'https://catalyst-storybook.vercel.app/?path=/docs/blogpostcard--docs';
const storyBookFrame = 'iframe[title="storybook-preview-iframe"]';
const blogPostCard = '#story--blogpostcard--blog-post-card-with-image--primary-inner';

test('blog post card', async ({ page }) => {
    await page.goto(badgeUrl);
    await expect(page.frameLocator(storyBookFrame).locator(blogPostCard).getByRole('link', { name: 'Blog Post Title' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});
