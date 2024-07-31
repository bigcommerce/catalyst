import { expect, test } from '@playwright/test';

import routes from '~/tests/routes';

// TODO: Fix visual regression test
test.skip('blog post card', async ({ page }) => {
  // Arrange
  await page.goto(routes.BLOG);
  await page.getByRole('heading', { name: 'Blog', exact: true }).waitFor();

  // Act
  const blogPostCard = page.getByRole('listitem').filter({ hasText: 'Your first blog post!' });

  // Assert
  await expect(blogPostCard).toHaveScreenshot();
});
