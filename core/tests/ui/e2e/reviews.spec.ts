import { faker } from '@faker-js/faker';

import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';
import { TAGS } from '~/tests/tags';

test(
  'Submit a review as a non-logged in customer',
  { tag: [TAGS.writesData] },
  async ({ page, catalog }) => {
    const t = await getTranslations('Product.Reviews.Form');
    const product = await catalog.getDefaultOrCreateSimpleProduct();

    await page.goto(product.path);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: t('button') }).click();

    const modal = page.getByRole('dialog');

    await expect(modal.getByRole('heading', { name: t('title') })).toBeVisible();

    const rating = faker.number.int({ min: 1, max: 5 });
    const ratingLabel = rating === 1 ? '1 star' : `${rating} stars`;

    await modal.getByLabel(ratingLabel).click();

    const reviewTitle = faker.lorem.sentence();

    await modal.getByLabel(t('titleLabel')).fill(reviewTitle);

    const reviewText = faker.lorem.paragraph();

    await modal.getByLabel(t('reviewLabel')).fill(reviewText);

    const customerName = faker.person.fullName();

    await modal.getByLabel(t('nameLabel')).fill(customerName);

    const customerEmail = faker.internet.email();

    await modal.getByLabel(t('emailLabel')).fill(customerEmail);

    await expect(modal.getByLabel(t('nameLabel'))).toBeEnabled();
    await expect(modal.getByLabel(t('emailLabel'))).toBeEnabled();

    await modal.getByRole('button', { name: t('submit') }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(t('successMessage'))).toBeVisible();
    await expect(modal).toBeHidden();
    await expect(page.getByRole('button', { name: t('button') })).toBeVisible();
  },
);

test('Shows validation errors when submitting review form with empty inputs', async ({
  page,
  catalog,
}) => {
  const t = await getTranslations('Product.Reviews.Form');
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await page.goto(product.path);
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: t('button') }).click();

  const modal = page.getByRole('dialog');

  await expect(modal.getByRole('heading', { name: t('title') })).toBeVisible();

  await modal.getByRole('button', { name: t('submit') }).click();
  await page.waitForLoadState('networkidle');

  await expect(modal).toBeVisible();

  const ratingField = modal.getByLabel(t('ratingLabel'));
  const titleField = modal.getByLabel(t('titleLabel'));
  const reviewField = modal.getByLabel(t('reviewLabel'));
  const nameField = modal.getByLabel(t('nameLabel'));
  const emailField = modal.getByLabel(t('emailLabel'));

  await expect(ratingField).toBeVisible();
  await expect(titleField).toBeVisible();
  await expect(reviewField).toBeVisible();
  await expect(nameField).toBeVisible();
  await expect(emailField).toBeVisible();

  const errorMessages = modal.locator('text=/required|invalid/i');

  await expect(errorMessages.first()).toBeVisible();
  await expect(errorMessages.nth(1)).toBeVisible();
  await expect(errorMessages.nth(2)).toBeVisible();
  await expect(errorMessages.nth(3)).toBeVisible();
  await expect(errorMessages.nth(4)).toBeVisible();
});
