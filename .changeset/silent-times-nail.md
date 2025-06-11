---
"@bigcommerce/catalyst-core": patch
---

Updates `SelectField` to have a hidden input to pass the value of the select to the form. This is a workaround for a [Radix Select issue](https://github.com/radix-ui/primitives/issues/3198) that auto selects the first option in the select when submitting a form (even when no selection has been made).

Additionally, fixes an issue of incorrectly adding an empty query param for product options when an option is empty.

## Migration

Migration is straighforward and requires adding the hidden input to the component and renaming the `name` prop for the `Select` component to something temporary.
