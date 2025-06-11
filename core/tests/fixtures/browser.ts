import { Browser, BrowserContext } from '@playwright/test';

import { extendedPage } from './page';

// We need to ensure that BrowserContext.newPage returns the extended page type,
// otherwise calling .waitForURL() on the new page will not work when using alternate locales.
export function extendedBrowser(browser: Browser): Browser {
  const originalNewContext = browser.newContext.bind(browser);

  const browserWithOverrides: Browser = Object.assign(browser, {
    newContext: async (...args: Parameters<typeof browser.newContext>) => {
      const context = await originalNewContext(...args);

      return extendedBrowserContext(context);
    },
  });

  return browserWithOverrides;
}

function extendedBrowserContext(context: BrowserContext) {
  const originalNewPage = context.newPage.bind(context);

  const contextWithOverrides: BrowserContext = Object.assign(context, {
    newPage: async (...args: Parameters<typeof context.newPage>) => {
      const page = await originalNewPage(...args);

      return extendedPage(page);
    },
  });

  return contextWithOverrides;
}
