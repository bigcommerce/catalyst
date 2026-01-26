---
"@bigcommerce/catalyst-core": patch
---

Add default optional text to form input labels for inputs that are not required.

## Migration

The new required props are optional, so they are backwards compatible. However, this does mean that the `(optional)` text will now show up on fields that aren't explicitly marked as required by passing the required prop to the Label component.
