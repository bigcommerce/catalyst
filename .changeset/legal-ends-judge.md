---
"@bigcommerce/catalyst-core": minor
---

In order to maintain parity with Stencil's 404 page, we wanted to allow the user to search from the 404 page. Since the search included with the header component is fully featured, we included a CTA to open the same search that you get when clicking the search icon in the header.

**Migration**
Most changes are additive, so they should hopefully be easy to resolve if flagged for merge conflicts. Change #3 below replaces the Search state with the new search context, be sure to pay attention to the new

1. This change adds a new directory under `core/` called `context/` containing a `search-context.tsx` file. Since this is a new file, there shouldn't be any merge conflicts
2. `SearchProvider` is imported into `core/app/providers` and replaces the React fragment (`<>`) that currently wraps `<Toaster>` and `{children}`
3. In `core/vibes/soul/primitives/navigation`, replace `useState` with `useSearch` imported from the new context file, and update the dependency arrays for the `useEffect`'s in the `Navigation component`
4. Add search `Button` that calls `setIsSearchOpen(true)` to the `NotFound` component in `core/vibes/sections/not-found/index.tsx`
