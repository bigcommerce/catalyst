# Data check: special cases

Read this file in step 2 when the usual check does not fit. The goal does not change. Find out if the store can support the feature before you write code. Stop early when it cannot.

## Find the data

- Start at `type Site`. Some data is on other root fields, such as `inventory` and `customer`. `schema.mjs info` shows them.
- Do not use `[DEPRECATED]` fields. If the only field for a need is deprecated, tell the user.
- A metafield needs a namespace and a key. The schema does not show them. Ask the user for them.
- Obey the display settings of the store, such as `settings.inventory.stockLevelDisplay`. If the request does not agree with a setting, tell the user.

## Use `query.mjs`

- The script runs as a guest. It accepts only read queries. It checks the fields against the schema before it sends the query.
- It prints compact JSON. It stops when the output has more than 8000 characters. Thus, select few fields.
- Send input objects as variables, not inline. The store rejects some inline values.
- Add `--locale <code>` to send `Accept-Language`. The storefront sends it too.
- To list the locales and their paths, query `site { settings { locales { code isDefault path } } }`.
- Some data is in more than one place. For example, a category image can be on `categoryTree { image }` or on `category(entityId) { defaultImage }`. Put each place in the first query.

## Special cases

### Signed-in data (`customer`)

`query.mjs` runs as a guest, so it cannot see this data. Check the fields with `schema.mjs` only. Tell the user that you did not check the data. `verify-catalyst` can sign in with a test customer. Ask the user for one.

### A list that the shopper fills (for example, recently viewed)

Check that the query works with real IDs. Get the IDs from a list query first, such as `products(first: 5)`.

### Search

Test with a word from the name of a real product.

### A change to an existing feature

Read its data file first. Then you check the same query.

### A feature on each page

Do not use fields that need an entity ID.

### A type with a smaller scope than the request

For example, banners exist for each page type, but the request is for each page. Tell the user which scope you chose.

### Content with dates

The schema does not show the dates. Thus, do not say that the API filters by date. The cache can delay a start or an end by `revalidate` seconds. Tell the user.

### No filter selects the items (for example, products on sale)

Do not loop over catalog pages when a page renders. Each page view would then send all the requests. Get one page (`first: 50` or fewer) from a limited source, such as one category. Tell the user the limit.

### The user wants the build before the data exists

Add sample data to `data.ts`. Mark it with `SAMPLE-DATA`. Then the first page check can show it. `check.mjs` fails until you remove it.
