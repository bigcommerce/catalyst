import { expect, test } from '@playwright/test';
import { z } from 'zod';

const uuidMatcher = /[0-9a-fA-F-]{16,}/;

const CookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  expires: z.number().optional(),
});

test.describe('Analytics cookies middleware', () => {
  test('sets visitorId and visitId cookies on first visit', async ({ page, context }) => {
    await page.goto('/');

    const cookies = await context.cookies();
    const visitorId = cookies.find((c) => c.name === 'visitorId');
    const visitId = cookies.find((c) => c.name === 'visitId');

    expect(visitorId).toBeDefined();
    expect(visitorId?.value).toMatch(uuidMatcher);
    expect(visitId).toBeDefined();
    expect(visitId?.value).toMatch(uuidMatcher);
  });

  test('visitId cookie has correct expiry', async ({ page, context }) => {
    await page.goto('/');

    const cookies = await context.cookies();
    const visitId = cookies.find((c) => c.name === 'visitId');
    const parsed = CookieSchema.safeParse(visitId);

    if (parsed.success && parsed.data.expires) {
      const visitIdExpiry = new Date(parsed.data.expires * 1000);
      const now = Date.now();

      expect(visitIdExpiry.getTime()).toBeGreaterThan(now);
      expect(visitIdExpiry.getTime()).toBeLessThan(now + 31 * 60 * 1000); // +1 minute buffer
    }
  });

  test('visitorId cookie has correct expiry', async ({ page, context }) => {
    await page.goto('/');

    const cookies = await context.cookies();
    const visitorId = cookies.find((c) => c.name === 'visitorId');
    const parsed = CookieSchema.safeParse(visitorId);

    if (parsed.success && parsed.data.expires) {
      const visitorIdExpiry = new Date(parsed.data.expires * 1000);
      const now = Date.now();

      expect(visitorIdExpiry.getTime()).toBeGreaterThan(now);
      expect(visitorIdExpiry.getTime()).toBeLessThan(now + 401 * 24 * 60 * 60 * 1000); // +1 day buffer
    }
  });

  test('creates a new visitId after expiry', async ({ page, context }) => {
    await page.goto('/');

    let cookies = await context.cookies();
    const oldVisitId = cookies.find((c) => c.name === 'visitId')?.value;

    // Simulate expiry by clearing the visitId cookie
    await context.clearCookies();
    await page.reload();

    cookies = await context.cookies();

    const newVisitId = cookies.find((c) => c.name === 'visitId')?.value;

    expect(newVisitId).toBeDefined();
    expect(newVisitId).not.toBe(oldVisitId);
  });
});
