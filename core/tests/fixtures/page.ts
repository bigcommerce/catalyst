import { expect, ExpectMatcherState, MatcherReturnType, Page } from '@playwright/test';

import { defaultLocale } from '~/i18n/locales';
import { testEnv } from '~/tests/environment';

export function extendedPage(page: Page) {
  const originalWaitForURL = page.waitForURL.bind(page);
  const pageWithOverrides: Page = Object.assign(page, {
    // Overrides the page.waitForURL method to ensure that locale-specific URLs are also handled.
    // This ensures that an /account/orders/ assertion will also work for /de/account/orders/ for easier usage in tests.
    waitForURL: (...[url, options]: Parameters<typeof page.waitForURL>) => {
      if (
        typeof url === 'string' &&
        testEnv.TESTS_LOCALE !== defaultLocale &&
        url.startsWith('/')
      ) {
        return Promise.race([
          originalWaitForURL(url, options),
          originalWaitForURL(`/${testEnv.TESTS_LOCALE}${url}`, options),
        ]);
      }

      return originalWaitForURL(url, options);
    },
  });

  return pageWithOverrides;
}

// Override expect(page).toHaveURL assertion to ensure we are also checking locale-specific URLs when using relative paths.
// e.g. expect(page).toHaveURL('/account/orders/') will expect /de/account/orders/ if the locale is set to 'de' and is not the default locale.
export async function toHaveURL(
  this: ExpectMatcherState,
  page: Page,
  url: string | RegExp | ((url: URL) => boolean),
  options?: { timeout?: number; ignoreCase?: boolean },
): Promise<MatcherReturnType> {
  const assertionName = 'toHaveURL';
  let pass: boolean;
  let matcherResult: MatcherReturnType | undefined;

  const isRelativeLocaleUrl =
    typeof url === 'string' && testEnv.TESTS_LOCALE !== defaultLocale && url.startsWith('/');

  try {
    const expectation = this.isNot ? expect(page).not : expect(page);
    const urlsToCheck = isRelativeLocaleUrl ? [url, `/${testEnv.TESTS_LOCALE}${url}`] : [url];
    const checks = urlsToCheck.map((u) => expectation.toHaveURL(u, options));

    if (this.isNot) {
      // if we are negating the assertion, all checks must be executed
      await Promise.all(checks);
    } else {
      // if promise is not negated, we only need to wait for one of the checks to pass
      await Promise.race(checks);
    }

    pass = true;
  } catch (error: unknown) {
    if (error instanceof Error && 'matcherResult' in error) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      matcherResult = error.matcherResult as MatcherReturnType;
    }

    pass = false;
  }

  if (this.isNot) {
    pass = !pass;
  }

  const matcherHint = this.utils.matcherHint(assertionName, undefined, undefined, {
    isNot: this.isNot,
  });

  const expectedMessage = (): string => {
    const notPrefix = this.isNot ? 'not ' : '';

    if (typeof url === 'string') {
      const urlWithLocaleMaybe =
        testEnv.TESTS_LOCALE !== defaultLocale && url.startsWith('/')
          ? `/${testEnv.TESTS_LOCALE}${url}`
          : url;

      const absoluteUrl = new URL(urlWithLocaleMaybe, page.url());

      return `Expected: ${notPrefix}${this.utils.printExpected(absoluteUrl)}`;
    } else if (url instanceof RegExp) {
      return `Expected URL ${notPrefix}to match pattern ${this.utils.printExpected(url)}`;
    }

    return `Expected URL predicate to ${notPrefix}succeed`;
  };

  const receivedMessage = matcherResult
    ? `Received: ${this.utils.printReceived(matcherResult.actual)}`
    : '';

  const message = () => `${matcherHint}\n\n${expectedMessage()}\n${receivedMessage}`;

  return {
    message,
    pass,
    name: assertionName,
    expected: url,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    actual: matcherResult?.actual,
  };
}
