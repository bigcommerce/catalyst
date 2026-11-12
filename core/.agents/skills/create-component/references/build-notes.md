# Build notes

These are facts about this codebase. An agent that finds them by trial loses time. Read the part that you need.

## Data files

- Flatten `edges` and `nodes` with `removeEdgesAndNodes` from `@bigcommerce/catalyst-client`. Do not flatten plain lists, such as `categoryTree`.
- A signed-in shopper gets `{ cache: 'no-store' }`.
- A guest result can use `revalidate` when all its inputs are in the query variables. Each set of variables gets a separate cache entry.
- Copy the fetch line from `app/[locale]/(default)/page-data.ts`.
- If the user gives a cache time, use it for guest data only.
- An empty list in an `entityIds` filter returns all items. Return early instead.
- `productCardTransformer` returns price strings. If the UI calculates with prices, keep the numbers. Format them in the UI.
- Give an image `urlTemplate` to `Image` from `~/components/image` without changes. Its loader adds the size.
- `data.ts` can import types from the section.

## Sections

- Put `SectionLayout` inside the `Stream`. Then an empty result adds no padding.
- Do not use `SectionLayout` in a layout that adds padding already, such as the account pages.
- A page can exist only for one widget, such as an account dashboard. On that page, show a zero value ($0.00), not nothing.
- A client part without UI, such as a tracker, goes in `components/<name>/`.
- A server component cannot give a function to a client component. Give it values, such as a boolean.
- An existing section can have the correct shape but show an unwanted empty state. In that case, put its inner primitive in a new section.
- Do not import a section that has the name of a different feature. Copy its pattern, and give it a new name.
- Make text with a count in the page. Use `t('key', { count })` and an ICU plural in `en.json`. Give the finished text to the section.

## Consent

- On the server, use `hasConsentFor('functionality')` from `~/lib/consent-manager/has-consent-for`. `setPreferredCurrencyCode` in `~/lib/currency` is an example.
- On the client, use `useConsentManager().consents.functionality` from `@c15t/nextjs/client`.
- In a header or footer part, read consent on the client. The layout does not render again when the shopper moves to a different page.

## Edits while the dev server runs

- The dev server compiles each saved file. Put one expression in one edit.
- Do not put the two halves of a bracket pair in different edits.
- To replace a component, do these steps in this order: add the new import, change the JSX, then remove the old import.
- Edit files with your edit tool, not `sed -i`. The `sed` command works differently on macOS.
- Do not edit `messages/en.d.json.ts`. The dev server writes it again after you change `en.json`.
- Before the dev server starts one time, typecheck shows errors for `build-config.json`, `next-env.d.ts`, and image imports. Those errors are not yours.
- Put temporary files in `.verification/`. Git ignores this folder. Make it with `mkdir -p`.

## Shell, lint, and typecheck

- The zsh shell stops a command when a glob finds no file. Put quotes around each glob, such as `--include='*.ts'`.
- Lint does not permit `for...of` loops or `await` in a loop. Use array methods and `Promise.all`.
- Give an empty array a type, such as `const items: Item[] = []`.
- Do not use `any` or a cast to hide an error. Fix the query (step 4) or the props (step 5).
- Do not send eslint output into `tail` or `head`. The pipe hides the exit code.
- When `eslint --fix` exits with 0, it is complete.
- A file can have more than 600 lines. In that file, find the part that you need with `grep -n`. Read only that part.
