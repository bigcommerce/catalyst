---
"@bigcommerce/catalyst-core": minor
---

## New

This refactor optimizes home page, header, and footer for caching and the eventual use of dynamicIO. With these changes we leverage data caching to hit mostly cache data for guest shoppers in different locales and with different currencies.

## Key modifications include:

- Header and Footer now have a blocking request for the shared data that is the same for all users.
- Data that can change for logged in users is now a separate request.
- Our query functions now take in all params required for fetching, instead of accessing dynamic variables internally. This is important to serialize arguments if we want to eventually `use cache`.
- Dynamic fetches (using customerAccessToken or preferred currency) are now all streaming queries.
- Use `Streamable.from` to generate our streaming props that are passed to our UI components.
- Update Header UI component to allow streaming in of currencies data.

## Migration instructions:

- Renamed `/app/[locale]/(default)/query.ts` to `/app/[locale]/(default)/page-data.ts`, include page query on this page.
- Updated `/app/[locale]/(default)/page.ts` to use `Streamable.from` pattern.
- Split data that can vary by user from `core/components/footer/fragment.ts` and `core/components/header/fragment.ts`
- Updated `core/components/header/index.tsx` and `core/components/footer/index.tsx` to fetch shared data in a blocking request and pass data that varies by customer as streamable data. Updated to use the new `Streamable.from` pattern.
