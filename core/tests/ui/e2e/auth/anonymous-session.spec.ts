import { expect, test } from '~/tests/fixtures';

test.describe('Anonymous session middleware', () => {
  test('handles invalid anonymous JWT cookie gracefully', async ({ page, context }) => {
    // Set an invalid anonymous JWT cookie to simulate the issue
    await context.addCookies([
      {
        name: 'authjs.anonymous-session-token',
        value: 'invalid.jwt.token.from.previous.instance',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);

    // Listen for console errors to verify logging
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the homepage - this should trigger the middleware
    await page.goto('/');

    // The page should load successfully despite the invalid cookie
    await expect(page).toHaveTitle(/.*Catalyst/);

    // Check that the invalid cookie was cleared and a new valid one was set
    const cookies = await context.cookies();
    const anonymousCookie = cookies.find((c) => c.name === 'authjs.anonymous-session-token');

    // Should have a new valid cookie (not the invalid one we set)
    expect(anonymousCookie).toBeDefined();
    expect(anonymousCookie?.value).not.toBe('invalid.jwt.token.from.previous.instance');

    // Verify that the application continues to work normally
    // For example, check that navigation works
    const navigation = page.getByRole('navigation', { name: 'Main' });

    await expect(navigation).toBeVisible();
  });

  test('creates anonymous session when no cookie exists', async ({ page, context }) => {
    // Clear all cookies first
    await context.clearCookies();

    await page.goto('/');

    // Should create a new anonymous session cookie
    const cookies = await context.cookies();
    const anonymousCookie = cookies.find((c) => c.name === 'authjs.anonymous-session-token');

    expect(anonymousCookie).toBeDefined();
    expect(anonymousCookie?.value).toBeTruthy();
  });
});
