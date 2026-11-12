# Check the page

Read this file in step 8. Check the new component on the dev server that runs for this folder.

## Find the page

- The site sends `/` to a locale path, such as `/en-en`. Use `curl -sL` to follow it.
- To list each locale and its path, run `query.mjs '{ site { settings { locales { code isDefault path } } } }'`.
- Check a feature with text on each locale path. Do not guess a path, such as `/fr`.
- Find real page paths in the links of the header and the footer. A 404 means that the path does not exist.
- The cart page stops early when there is no cart. Thus, a cart section does not show for a new visitor. Do not add items yourself. Ask the user to add an item in the browser. Then check.

## Read the HTML

- Do not print a full page. Send the `curl` output to `grep`.
- Search for your own markup, such as a heading or a `data-` attribute.
- The HTML contains all message text. Thus, an error message in the HTML proves nothing.
- Do not parse the React stream payload.

## Test data for each shopper

- To test a feature that reads a cookie, send the cookie with `curl -sL -b 'name=value'`.
- Then load the page without the cookie. This proves that the page does not give one shopper's result to another shopper.
- Some stores have no cookie consent. On these stores, all consent categories are on. To test the path without consent, set the value to `false` for one check. Then remove that change.

## Use a browser

- For a screenshot, use `verify-catalyst` with `--url <dev server URL>`. It needs Chromium. If Chromium is not installed, use a different browser tool.
- Wait 2 seconds after the page loads. A client component starts late.
- Use one tab. Go to one page at a time.
- Clear the state, load the page again, and then read the result.
- To test a limit, such as 8 items, set the state with one script call. Do not click through many pages.
- For a test that you can run again, write a `verify-catalyst` journey.
- Read the state from the DOM. A screenshot can show an old state.
- A click from a browser tool can scroll the page. Some popups close when the page scrolls.

## Test the keyboard

- Open the widget, and press the keys.
- Then read the result in one script call: `document.activeElement`, `aria-activedescendant`, and `aria-selected`.
- Take one screenshot at the end, not one after each key.
- After a key that closes the widget, wait 1 second. The close animation must end before you check the focus.

## Ignore old errors

- Ignore `_next/hmr` websocket errors. The dev server causes them.
- Old compile errors stay in the console after a fix. If typecheck passes and the page returns 200, a parse error in the console is old. Do not load the page again to find it.

## Old data after a store change

The page can show old data after the store data changes. Next keeps fetch results on disk (`.next/dev/cache/fetch-cache`) and in memory. Delete that folder. Then start the dev server again. If you did not start the server, ask the user first.
