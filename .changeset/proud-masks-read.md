---
"@bigcommerce/catalyst-core": patch
---

We want state to be persitent on the `ProductDetailForm`, even after submit. This change will allow the API error messages to properly show when the form is submitted. Additionally, other form fields will retain state (like item quantity).

## Migration

- Update `ProductDetailForm` to prevent reset on submit, by removing `requestFormReset` in the `onSubmit`.
- Remove `router.refresh()` call and instead call new `revalidateCart` action.
  - `revalidateCart` is an action that `revalidateTag(TAGS.cart)`
  - This prevents the form from fully refreshing on success.
