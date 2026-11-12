# Notes

Read the section for your step. Each note saves a search or a failed try.

## Step 2: check the data

- Start at `type Site`. Some data is on other root fields, such as `inventory` and `customer`. `schema.mjs info` shows them.
- Do not use `[DEPRECATED]` fields. If the only field for a need is deprecated, tell the user.
- A metafield needs a namespace and a key. The schema does not show them, so ask the user.
- Obey the display settings of the store, such as `settings.inventory.stockLevelDisplay`. If the request does not agree with a setting, tell the user.
- `query.mjs` stops when its output has more than 8000 characters. Select few fields.
- Send input objects as variables. The store rejects some inline values.
- Some data is in more than one place. A category image can be on `categoryTree { image }` or on `category(entityId) { defaultImage }`. Put each place in the first query.
- To list the locales and their paths, query `site { settings { locales { code isDefault path } } }`. Add `--locale <code>` to read one locale.

| Case                                             | Do this                                                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Signed-in data (`customer`)                      | `query.mjs` runs as a guest, so it cannot see this data. Check the fields with `schema.mjs`. Tell the user that you did not check the data.    |
| A list that the shopper fills (recently viewed)  | Get real IDs with a list query, such as `products(first: 5)`. Then test with those IDs.                                                        |
| Search                                           | Test with a word from the name of a real product.                                                                                              |
| A change to an existing feature                  | Read its data file first. Then check the same query.                                                                                           |
| A feature on each page                           | Do not use fields that need an entity ID.                                                                                                      |
| A type that has a smaller scope than the request | Tell the user which scope you chose. For example, banners exist for each page type only.                                                       |
| Content with dates                               | The schema does not show the dates. Do not say that the API filters by date. The cache can delay a change by `revalidate` seconds.             |
| No filter selects the items (products on sale)   | Do not loop over catalog pages during a render. Get one page (50 items or fewer) from one source, such as a category. Tell the user the limit. |
| The user wants the build before the data exists  | Add sample data marked `SAMPLE-DATA`. `check.mjs` fails until you remove it.                                                                   |

## Steps 4 and 5: build

- Flatten `edges` and `nodes` with `removeEdgesAndNodes`. Do not flatten plain lists, such as `categoryTree`.
- A guest result can use `revalidate` when all its inputs are in the query variables. Each set of variables gets a separate cache entry. If the user gives a cache time, use it for guest data only.
- An empty `entityIds` filter returns all items. Return early instead.
- `productCardTransformer` returns price strings. To calculate with prices, keep the numbers.
- Give an image `urlTemplate` to `Image` without changes. Its loader adds the size.
- Put `SectionLayout` inside the `Stream`, so that an empty result adds no padding. Do not use it in a layout that adds padding already, such as the account pages.
- On a page for one widget, such as an account dashboard, show a zero value ($0.00), not nothing.
- A server component cannot give a function to a client component. Give it values, such as a boolean.
- A client part without UI, such as a tracker, goes in `components/<name>/`.
- An existing section can show an unwanted empty state. Then put its inner primitive in a new section.
- Do not import a section that has the name of a different feature. Copy its pattern under a new name.
- Make text with a count in the page, with `t('key', { count })` and an ICU plural.
- In a header or footer part, read consent on the client. The layout does not render again when the shopper goes to a different page.

## While the dev server runs

- The dev server compiles each saved file. Put one expression in one edit.
- To replace a component, add the new import, change the JSX, and then remove the old import.
- Edit files with your edit tool, not `sed -i`. The `sed` command works differently on macOS.
- Do not edit `messages/en.d.json.ts`. The dev server writes it.
- Before the dev server starts one time, typecheck fails on `build-config.json`, `next-env.d.ts`, and image imports. Those errors are not yours.
- Put temporary files in `.verification/`. Git ignores this folder.

## Step 7: check the code

- Put quotes around each glob, such as `--include='*.ts'`. The zsh shell stops a command when a glob finds no file.
- Lint does not permit `for...of` loops or `await` in a loop. Use array methods and `Promise.all`.
- Give an empty array a type, such as `const items: Item[] = []`.
- Do not use `any` or a cast to hide an error. Fix the query or the props.
- Do not send eslint output into `tail` or `head`. The pipe hides the exit code.
- In a file with more than 600 lines, find the part with `grep -n`. Read only that part.

## Step 8: check the page

- The site sends `/` to a locale path, such as `/en-en`. Use `curl -sL`. Find real paths in the header and footer links.
- Search the HTML for your own markup, such as a heading. Do not print the full page. Streamed content can be missing from `curl` output. Then read the DOM in a browser.
- The HTML contains all message text. Thus, an error message in the HTML proves nothing.
- The cart page shows nothing for a visitor without a cart. Ask the user to add an item. Do not add one yourself.
- To test a cookie feature, send the cookie with `curl -sL -b 'name=value'`. Then load the page without it. This proves that one shopper does not get the result of a different shopper.
- For a screenshot, use `verify-catalyst` with `--url <dev server URL>`, or a different browser tool.
- In a browser, wait 2 seconds after the page loads. Use one tab and one page at a time. Read the state from the DOM, because a screenshot can be old.
- To test the keyboard, press the keys. Then read `document.activeElement`, `aria-activedescendant`, and `aria-selected` in one script call.
- Ignore `_next/hmr` errors. Errors from an earlier load stay in the console after a fix. If typecheck passes and the page returns 200, they are old.
- After a change to the store data, the page can show old data. Delete `.next/dev/cache/fetch-cache`, and start the dev server again. If you did not start the server, ask the user first.
