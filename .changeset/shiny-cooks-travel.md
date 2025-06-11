---
"@bigcommerce/catalyst-core": patch
---

- Fix incorrect/missing translation messages
- Separate defaultLocale in to a separate file
- Remove caching in `/account` pages
- Update `WishlistListItem` for better accessibility

## Migration

Use this PR as a reference: https://github.com/bigcommerce/catalyst/pull/2341

1. Update your `messages/en.json` file with the translation keys added in this PR
2. Ensure that all components are being passed the correct translation keys
3. Update all references to `defaultLocale` to point to the `~/i18n/locales` file created in this PR
4. Update all pages in `/core/app/[locale]/(default)/account/` and ensure that `cache: 'no-store'` is set on the `client.fetch` calls
5. Update the `WishlistListItem` component to use the new accessibility features/tags as shown in the PR
