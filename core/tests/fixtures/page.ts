// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { expect, ExpectMatcherState, MatcherReturnType, Page } from '@playwright/test';

import { testEnv } from '~/tests/environment';
import { isTestLocalePrefixed, withTestLocalePrefix } from '~/tests/lib/locale';

export function extendedPage(page: Page) {
  const originalWaitForURL = page.waitForURL.bind(page);
  const pageWithOverrides: Page = Object.assign(page, {
    // Overrides the page.waitForURL method to ensure that locale-specific URLs are also handled.
    // This ensures that an /account/orders/ assertion will also work for /de-de/account/orders/ for easier usage in tests.
    waitForURL: async (...[url, options]: Parameters<typeof page.waitForURL>) => {
      if (typeof url === 'string' && url.startsWith('/') && (await isTestLocalePrefixed())) {
        return Promise.race([
          originalWaitForURL(url, options),
          originalWaitForURL(await withTestLocalePrefix(url), options),
        ]);
      }

      return originalWaitForURL(url, options);
    },
  });

  return pageWithOverrides;
}

function normalizeForTrailingSlashEnvVar(url: string): string {
  const [pathname = '/', searchAndHash = ''] = url.split(/([?#].*)/);

  if (!testEnv.TRAILING_SLASH) {
    if (pathname !== '/' && pathname.endsWith('/')) {
      return pathname.slice(0, -1) + searchAndHash;
    }

    return pathname + searchAndHash;
  }

  if (pathname !== '/' && !pathname.endsWith('/')) {
    return `${pathname}/${searchAndHash}`;
  }

  return pathname + searchAndHash;
}

// Override expect(page).toHaveURL assertion to ensure we are also checking locale-specific URLs when using relative paths.
// e.g. expect(page).toHaveURL('/account/orders/') will also accept /de-de/account/orders/.
export async function toHaveURL(
  this: ExpectMatcherState,
  page: Page,
  url: string | RegExp | ((url: URL) => boolean),
  options?: { timeout?: number; ignoreCase?: boolean },
): Promise<MatcherReturnType> {
  const assertionName = 'toHaveURL';
  let pass: boolean;
  let matcherResult: MatcherReturnType | undefined;

  // Resolved up front so the sync failure message below can reuse it.
  const prefixedUrl =
    typeof url === 'string' && url.startsWith('/') && (await isTestLocalePrefixed())
      ? await withTestLocalePrefix(url)
      : null;

  try {
    const expectation = this.isNot ? expect(page).not : expect(page);
    const urlsToCheck = prefixedUrl === null ? [url] : [url, prefixedUrl];

    // This ensures that if you call expect(page).toHaveURL('/my-url/') when TRAILING_SLASH=false, it asserts `/my-url`, and vice-versa.
    // Trailing slash assertions are updated to respect the TRAILING_SLASH env var.
    const updatedUrlsToCheck = urlsToCheck.map((urlToCheck) => {
      if (typeof urlToCheck === 'string') {
        return normalizeForTrailingSlashEnvVar(urlToCheck);
      }

      return urlToCheck;
    });

    const checks = updatedUrlsToCheck.map((u) => expectation.toHaveURL(u, options));

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
      const absoluteUrl = new URL(prefixedUrl ?? url, page.url());

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
