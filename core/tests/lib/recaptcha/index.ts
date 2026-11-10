import { errors, Page } from '@playwright/test';

const IFRAME = 'iframe[title="reCAPTCHA"]';

// Google's script injects the widget after the page settles, often after the form is filled,
// so an instant visibility check can skip it. Wait for the iframe before treating reCAPTCHA as
// disabled. The test key never shows a challenge, so ticking the box passes.
export async function completeRecaptchaIfEnabled(page: Page, timeout = 10_000) {
  const iframe = page.locator(IFRAME).first();

  try {
    await iframe.waitFor({ state: 'attached', timeout });
  } catch (error) {
    if (error instanceof errors.TimeoutError) return false;

    throw error;
  }

  const frame = iframe.contentFrame();

  await frame.locator('.recaptcha-checkbox-border').click();
  await frame.locator('.recaptcha-checkbox-checked').waitFor();

  return true;
}
