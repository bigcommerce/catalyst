import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

test('blog post card', async ({ page }) => {
  await page.goto(routes.BLOG);

  await page.getByRole('heading', { name: 'Blog', exact: true }).waitFor();

  const blogPostCard = page.getByRole('listitem').filter({ hasText: 'Your first blog post!' });

  await expect(blogPostCard).toHaveScreenshot();
});
