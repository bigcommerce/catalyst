import { z } from 'zod';

import { testEnv } from '~/tests/environment';
import { expect, test } from '~/tests/fixtures';

const CookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  expires: z.number().optional(),
});

// The consent cookie uses c15t's compact format; only granted categories are present.
const acceptedConsentCookie = () => ({
  name: 'c15t-consent',
  value: `i.t:${Date.now()},c.necessary:1,c.functionality:1,c.marketing:1,c.measurement:1`,
  url: testEnv.PLAYWRIGHT_TEST_BASE_URL,
});

const declinedConsentCookie = () => ({
  name: 'c15t-consent',
  value: `i.t:${Date.now()},c.necessary:1`,
  url: testEnv.PLAYWRIGHT_TEST_BASE_URL,
});

test.describe('Analytics cookies proxy', () => {
  test('sets visitorId and visitId cookies on first visit with measurement consent', async ({
    page,
    context,
  }) => {
    await context.addCookies([acceptedConsentCookie()]);
    await page.goto('/');

    const cookies = await context.cookies();
    const visitorId = cookies.find((c) => c.name === 'catalyst.visitorId');
    const visitId = cookies.find((c) => c.name === 'catalyst.visitId');

    expect(visitorId).toBeDefined();
    expect(visitorId?.value).toBeUuid();
    expect(visitId).toBeDefined();
    expect(visitId?.value).toBeUuid();
  });

  test('visitId cookie has correct expiry', async ({ page, context }) => {
    await context.addCookies([acceptedConsentCookie()]);
    await page.goto('/');

    const cookies = await context.cookies();
    const visitId = cookies.find((c) => c.name === 'catalyst.visitId');
    const parsed = CookieSchema.safeParse(visitId);

    if (parsed.success && parsed.data.expires) {
      const visitIdExpiry = new Date(parsed.data.expires * 1000);
      const now = Date.now();

      expect(visitIdExpiry.getTime()).toBeGreaterThan(now);
      expect(visitIdExpiry.getTime()).toBeLessThan(now + 31 * 60 * 1000); // +1 minute buffer
    }
  });

  test('visitorId cookie has correct expiry', async ({ page, context }) => {
    await context.addCookies([acceptedConsentCookie()]);
    await page.goto('/');

    const cookies = await context.cookies();
    const visitorId = cookies.find((c) => c.name === 'catalyst.visitorId');
    const parsed = CookieSchema.safeParse(visitorId);

    if (parsed.success && parsed.data.expires) {
      const visitorIdExpiry = new Date(parsed.data.expires * 1000);
      const now = Date.now();

      expect(visitorIdExpiry.getTime()).toBeGreaterThan(now);
      expect(visitorIdExpiry.getTime()).toBeLessThan(now + 401 * 24 * 60 * 60 * 1000); // +1 day buffer
    }
  });

  test('creates a new visitId after expiry', async ({ page, context }) => {
    await context.addCookies([acceptedConsentCookie()]);
    await page.goto('/');

    let cookies = await context.cookies();
    const oldVisitId = cookies.find((c) => c.name === 'catalyst.visitId')?.value;

    // Simulate expiry by clearing the visitId cookie
    await context.clearCookies();
    await context.addCookies([acceptedConsentCookie()]);
    await page.reload();

    cookies = await context.cookies();

    const newVisitId = cookies.find((c) => c.name === 'catalyst.visitId')?.value;

    expect(newVisitId).toBeDefined();
    expect(newVisitId).not.toBe(oldVisitId);
  });

  test('does not set analytics cookies when measurement consent is declined', async ({
    page,
    context,
  }) => {
    await context.addCookies([declinedConsentCookie()]);
    await page.goto('/');

    const cookies = await context.cookies();

    expect(cookies.find((c) => c.name === 'catalyst.visitorId')).toBeUndefined();
    expect(cookies.find((c) => c.name === 'catalyst.visitId')).toBeUndefined();
  });

  test('removes analytics cookies when measurement consent is withdrawn', async ({
    page,
    context,
  }) => {
    await context.addCookies([acceptedConsentCookie()]);
    await page.goto('/');

    let cookies = await context.cookies();

    expect(cookies.find((c) => c.name === 'catalyst.visitorId')).toBeDefined();
    expect(cookies.find((c) => c.name === 'catalyst.visitId')).toBeDefined();

    await context.addCookies([declinedConsentCookie()]);
    await page.reload();

    cookies = await context.cookies();

    expect(cookies.find((c) => c.name === 'catalyst.visitorId')).toBeUndefined();
    expect(cookies.find((c) => c.name === 'catalyst.visitId')).toBeUndefined();
  });
});
