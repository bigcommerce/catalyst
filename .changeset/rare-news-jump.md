---
"@bigcommerce/catalyst-core": patch
---

Fix blog post card date formatting on alternate locales

## Migration

### `core/vibes/soul/primitives/blog-post-card/index.tsx`

Update the component to use `<time dateTime={date}>{date}</time>` for the date, instead of calling `new Date(date).toLocaleDateString(...)`.
