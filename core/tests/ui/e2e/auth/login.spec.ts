import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test.use({ reuseCustomerSession: false });

test.describe('Login with username and password', () => {
  test('Login and logout flows work as expected', async ({ page, customer }) => {
    const t = await getTranslations();

    await customer.login();
    await page.waitForURL('/account/orders/');
    await expect(
      page.getByRole('heading', { name: t('Account.Orders.title') }).first(),
    ).toBeVisible();

    await customer.logout();
    await expect(page.getByRole('heading', { name: t('Auth.Login.heading') })).toBeVisible();
  });

  test('Login with redirectTo query parameter works with a simple path', async ({
    page,
    customer,
  }) => {
    const redirectTo = '/test-path/';

    await customer.login(redirectTo);
    await page.waitForURL(redirectTo);
  });

  test('Login with redirectTo query parameter works with a path containing query parameters', async ({
    page,
    customer,
  }) => {
    const redirectTo = '/test-path/?param1=value1&param2=value2';

    await customer.login(redirectTo);
    await page.waitForURL(redirectTo);
  });

  test('Login with invalid credentials returns an error', async ({ page }) => {
    const t = await getTranslations('Auth.Login');

    await page.goto(`/login`);
    await page.getByLabel(t('email')).fill('invalid-email-testing@testing.com');
    await page.getByLabel(t('password')).fill('invalid-password');
    await page.getByRole('button', { name: t('cta') }).click();

    await expect(page.getByText(t('invalidCredentials'))).toBeVisible();
  });

  test('Browsing to /login/ when already logged in redirects to /account/orders/', async ({
    page,
    customer,
  }) => {
    const t = await getTranslations();
    const ordersHeader = t('Account.Orders.title');

    await customer.login();
    await page.waitForURL('/account/orders/');
    await expect(page.getByRole('heading', { name: ordersHeader })).toBeVisible();

    await page.goto('/login/');
    await page.waitForURL('/account/orders/');
    await expect(page.getByRole('heading', { name: ordersHeader })).toBeVisible();
  });
});

test.describe('Login with JWT', () => {
  test('JWT login works as expected and redirects to /account/orders/ by default', async ({
    page,
    customer,
  }) => {
    const t = await getTranslations('Account.Orders');
    const { id } = await customer.getOrCreateTestCustomer();
    const jwt = await customer.generateLoginJwt(id);

    await page.goto(`/login/token/${jwt}`);
    await page.waitForURL('/account/orders/');
    await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();
  });

  test('JWT login redirects to the specified redirect_to value in the token payload', async ({
    page,
    customer,
  }) => {
    const t = await getTranslations('Account.Addresses');
    const { id } = await customer.getOrCreateTestCustomer();
    const jwt = await customer.generateLoginJwt(id, '/account/addresses/');

    await page.goto(`/login/token/${jwt}`);
    await page.waitForURL('/account/addresses/');
    await expect(page.getByRole('heading', { name: t('title') })).toBeVisible();
  });
});
