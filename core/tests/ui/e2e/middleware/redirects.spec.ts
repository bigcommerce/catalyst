import { faker } from '@faker-js/faker';

import { testEnv } from '~/tests/environment';
import { expect, test } from '~/tests/fixtures';
import { TAGS } from '~/tests/tags';

test('Middleware follows a dynamic 301 redirect correctly', async ({
  page,
  catalog,
  redirects,
}) => {
  const redirectFrom = `/test-dynamic-redirect-${faker.string.alpha(6)}`;
  const product = await catalog.getDefaultOrCreateSimpleProduct();

  await redirects.upsertRedirect({
    fromPath: redirectFrom,
    to: {
      type: 'product',
      entityId: product.id,
    },
  });

  await page.goto(redirectFrom);
  await expect(page).toHaveURL(product.customUrl.url);
});

test('Middleware follows a manual redirect correctly', async ({ page, redirects }) => {
  const fromPath = `/test-manual-redirect-${faker.string.alpha(6)}`;
  const toPath = `/test-manual-destination-${faker.string.alpha(6)}`;

  await redirects.upsertRedirect({
    fromPath,
    to: {
      type: 'url',
      url: toPath,
    },
  });

  // First, navigate to the original fromPath and expect to be redirected to toPath
  await page.goto(fromPath);
  await expect(page).toHaveURL(toPath);
});

test('Middleware follows redirects in respect to capitalization', async ({ page, redirects }) => {
  const fromPath = '/path-test';
  const toPath = '/path-TEST';

  await redirects.upsertRedirect({
    fromPath,
    to: {
      type: 'url',
      url: toPath,
    },
  });

  await page.goto(fromPath);
  await expect(page).toHaveURL(toPath);
});

test.describe(
  'Trailing slash redirect loop regression tests',
  { tag: TAGS.noTrailingSlash },
  () => {
    test.skip(() => testEnv.TRAILING_SLASH);

    test('Dynamic redirect to a product with a trailing slash in the url does not cause a redirect loop when TRAILING_SLASH=false', async ({
      page,
      catalog,
      redirects,
    }) => {
      const productUrlWithoutTrailingSlash = `/dynamic-redirect-product-${faker.string.alpha(6)}`;
      const product = await catalog.createSimpleProduct({
        customUrl: {
          url: `${productUrlWithoutTrailingSlash}/`,
        },
      });

      await redirects.upsertRedirect({
        fromPath: productUrlWithoutTrailingSlash,
        to: {
          type: 'product',
          entityId: product.id,
        },
      });

      await page.goto(productUrlWithoutTrailingSlash);
      await expect(page).toHaveURL(productUrlWithoutTrailingSlash);
    });

    test('Manual redirect from a non-trailing-slash path to a trailing-slash path does not cause a redirect loop when TRAILING_SLASH=false', async ({
      page,
      redirects,
    }) => {
      const pathNoSlash = `/test-manual-redirect-${faker.string.alpha(6)}`;

      await redirects.upsertRedirect({
        fromPath: pathNoSlash,
        to: {
          type: 'url',
          url: `${pathNoSlash}/`,
        },
      });

      await page.goto(pathNoSlash);
      await expect(page).toHaveURL(pathNoSlash);
    });
  },
);
