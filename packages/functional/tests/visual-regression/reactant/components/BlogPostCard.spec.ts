import { test, expect } from '@playwright/test';
import * as storyBookElements from '../StoryBookElements';

const blogPostCard = '#story--blogpostcard--blog-post-card-with-image--primary-inner';

test('blog post card', async ({ page }) => {
    await page.goto(storyBookElements.docsUrl + '/blogpostcard--docs');
    await expect(page.frameLocator(storyBookElements.storyBookFrame).locator(blogPostCard).getByRole('link', { name: 'Blog Post Title' })).toBeVisible();
    await expect(page).toHaveScreenshot();
});
