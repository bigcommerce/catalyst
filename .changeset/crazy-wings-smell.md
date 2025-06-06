---
"@bigcommerce/catalyst-core": patch
---

Add missing border style for `Input`, `NumberInput` and `DatePicker`.

## Migration

Following convention, add these conditional classes to the fields using `clsx`:

```
{
light:
    errors && errors.length > 0
    ? 'border-[var(--input-light-border-error,hsl(var(--error)))]'
    : 'border-[var(--input-light-border,hsl(var(--contrast-100)))]',
dark:
    errors && errors.length > 0
    ? 'border-[var(--input-dark-border-error,hsl(var(--error)))]'
    : 'border-[var(--input-dark-border,hsl(var(--contrast-500)))]',
}[colorScheme],
```
