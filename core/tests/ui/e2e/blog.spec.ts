import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Blog is accessible and displays posts', async ({ page, blog }) => {
  const t = await getTranslations('Blog');
  const { name, path } = await blog.getBlog();
  const posts = await blog.getPosts();

  await page.goto(path);
  await expect(page.getByRole('heading', { name })).toBeVisible();

  const breadcrumbs = page.getByLabel('breadcrumb');

  await expect(breadcrumbs.getByText(t('home'))).toBeVisible();
  await expect(breadcrumbs.getByText(name)).toBeVisible();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  posts.forEach(async (post) => {
    await expect(
      page.locator(`a[href*="${post.path}"]`).filter({ hasText: post.title }),
    ).toBeVisible();
  });
});

test('Blog can be filtered by tags', async ({ page, blog }) => {
  const t = await getTranslations('Blog');
  const { name, path } = await blog.getBlog();
  const tag = faker.string.alpha(10);
  const post = await blog.createPost({
    tags: [tag],
  });

  await page.goto(`${path}?tag=${tag}`);
  await expect(page.getByRole('heading', { name })).toBeVisible();

  const breadcrumbs = page.getByLabel('breadcrumb');

  await expect(breadcrumbs.getByText(t('home'))).toBeVisible();
  await expect(breadcrumbs.getByText(name)).toBeVisible();
  await expect(breadcrumbs.getByText(tag)).toBeVisible();
  await expect(page.getByRole('link', { name: post.title })).toBeVisible();
});

test('Blog post page displays content, breadcrumbs, tags, and author info', async ({
  page,
  blog,
}) => {
  const t = await getTranslations('Blog');
  const { name } = await blog.getBlog();
  const post = await blog.createPost({
    author: faker.person.fullName(),
    body: `
    <h1>Test header element</h2>
    <p>Test paragraph element</p>
    <div>Test div element</div>
    <a href="https://example.com">Test link element</a>
    `,
    tags: ['Tag 1', 'Tag 2'],
  });

  await page.goto(post.path);
  await expect(page.getByRole('heading', { name: post.title })).toBeVisible();

  const breadcrumbs = page.getByLabel('breadcrumb');

  await expect(breadcrumbs.getByText(t('home'))).toBeVisible();
  await expect(breadcrumbs.getByText(name)).toBeVisible();
  await expect(breadcrumbs.getByText(post.title)).toBeVisible();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await expect(page.getByText(post.author!)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tag 1' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tag 2' })).toBeVisible();
  await expect(page.getByText('Test header element')).toBeVisible();
  await expect(page.getByText('Test paragraph element')).toBeVisible();
  await expect(page.getByText('Test div element')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Test link element' })).toHaveAttribute(
    'href',
    'https://example.com',
  );
});
