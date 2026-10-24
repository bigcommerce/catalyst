# Search

Shoppers search the catalog from a popup in the header, which shows live category and product suggestions, or from the full search results page with sorting, filters, and pagination.

## Sub-features

- `search-popup` opens the header popup and shows suggestions as the shopper types.
- `search-submit` submits the query and lands on the results page.
- `search-results` lists matching products with sort and filters.
- `search-empty` shows the empty state for a query with no matches.

## How to get to it (user POV)

- Choose the search icon in the header (button `Open search popup`).
- Visit `/search?term=<query>` directly, for example from a shared link.

## Driving it with verify.mjs

Preconditions:

- At least one product name in the store contains your query. Pick the query by first exploring a category page.

- **Open popup.** `page.getByRole('button', { name: 'Open search popup' }).click()`. A `dialog` appears containing a `textbox` whose placeholder reads `Search products, categories, brands...` (store settings can change it).
- **Live suggestions.** `page.getByRole('dialog').getByRole('textbox').fill(query)`. Wait for `page.getByRole('dialog').getByRole('region', { name: 'Products' })` to be visible; each suggestion is an `article` with a `link` named after the product. A `Categories` region may also appear.
- **Submit.** Press `Enter` in the textbox or choose the `Search` button in the dialog. The URL contains `/search?term=` and the `heading` level 1 reads `Search results for "<query>"`.
- **Results page.** Products are `article` elements with a product `link`. Sorting uses `combobox` `Sort by:`; filters live in the `complementary` region headed `Filters`.
- **Empty state.** Search for a nonsense term (`zzqxv`). Assert that the result count is `0` and that no product `article` is rendered.

## Gotchas

- The popup's input is a `textbox`, not a `searchbox`. `getByRole('searchbox')` times out.
- Suggestions are debounced. Wait for the `Products` region, not a timeout.
- On mobile, the header collapses into a menu, but the `Open search popup` button stays visible.
- The search placeholder text comes from store settings, so locate the input by role inside the dialog, not by placeholder.
