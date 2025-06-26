import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test('Normal web page works and displays the HTML content', async ({ page, webPage }) => {
  const t = await getTranslations('WebPages.Normal');
  const { name, path } = await webPage.create({
    body: `
      <h1>I am some testing page content</h1>
      <p>This is a paragraph of text to test the web page rendering.</p>
      <p>It should be visible when the page is loaded.</p>
      <p>
        <a href="https://example.com">Do links work too?</a>
      </p>
      <div>Testing div element</div>
    `,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await page.goto(path!);
  await page.waitForLoadState('networkidle');

  const breadcrumbs = page.getByLabel('breadcrumb');

  await expect(breadcrumbs.getByText(t('home'))).toBeVisible();
  await expect(breadcrumbs.getByText(name)).toBeVisible();

  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByText('I am some testing page content')).toBeVisible();
  await expect(
    page.getByText('This is a paragraph of text to test the web page rendering.'),
  ).toBeVisible();
  await expect(page.getByText('It should be visible when the page is loaded.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Do links work too?' })).toHaveAttribute(
    'href',
    'https://example.com',
  );
  await expect(page.getByText('Testing div element')).toBeVisible();
});

test('Nested web pages display the children in the side menu, navigate correctly, and truncate breadcrumbs', async ({
  page,
  webPage,
}) => {
  const t = await getTranslations('WebPages.Normal');
  const parent = await webPage.create();
  const child1 = await webPage.create({ parentId: parent.id });
  const child2 = await webPage.create({ parentId: parent.id });
  const nestedChild = await webPage.create({ parentId: child1.id });
  const nestedChild2 = await webPage.create({ parentId: nestedChild.id });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await page.goto(parent.path!);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: parent.name })).toBeVisible();
  await expect(page.getByRole('link', { name: child1.name })).toBeVisible();
  await expect(page.getByRole('link', { name: child2.name })).toBeVisible();

  await page.getByRole('link', { name: child1.name }).click();
  await page.getByRole('link', { name: nestedChild.name }).click();
  await page.getByRole('link', { name: nestedChild2.name }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: nestedChild2.name })).toBeVisible();

  const breadcrumbs = page.getByLabel('breadcrumb');

  await expect(breadcrumbs.getByText(t('home'))).toBeVisible();
  await expect(breadcrumbs.getByText(parent.name)).toBeVisible();
  await expect(breadcrumbs.getByText('...')).toBeVisible();
  await expect(breadcrumbs.getByText(nestedChild.name)).toBeVisible();
  await expect(breadcrumbs.getByText(nestedChild2.name)).toBeVisible();
});

test('Contact page works with all fields and submits successfully', async ({ page, webPage }) => {
  const t = await getTranslations('WebPages.ContactUs');
  const contactPage = await webPage.create({
    type: 'contact_form',
    body: '<p>Reach out to us with any questions!</p>',
    email: faker.internet.email({ provider: 'catalyst-example.catalyst' }),
    contactFields: ['fullname', 'phone', 'companyname', 'orderno', 'rma'],
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  await page.goto(contactPage.path!);
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: contactPage.name })).toBeVisible();

  await page.getByLabel(t('Form.email')).fill(faker.internet.email());
  await page.getByLabel(t('Form.fullName')).fill(faker.person.fullName());
  await page.getByLabel(t('Form.phone')).fill(faker.phone.number());
  await page.getByLabel(t('Form.companyName')).fill(faker.company.name());
  await page.getByLabel(t('Form.orderNo')).fill(faker.string.numeric(10));
  await page.getByLabel(t('Form.rma')).fill(faker.string.numeric(10));
  await page.getByLabel(t('Form.comments')).fill(faker.lorem.paragraph());

  await page.getByRole('button', { name: t('Form.cta') }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(t('Form.success'))).toBeVisible();
  await expect(page.getByRole('link', { name: t('Form.successCta') })).toBeVisible();
});
