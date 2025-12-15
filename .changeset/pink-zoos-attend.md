---
"@bigcommerce/catalyst-core": patch
---

Add missing check for optional text field in `core/vibes/soul/form/dynamic-form/schema.ts`.

## Migration

Add `if (field.required !== true) fieldSchema = fieldSchema.optional();` to `text` case in `core/vibes/soul/form/dynamic-form/schema.ts`:

```typescript
case 'text':
    fieldSchema = z.string();

    if (field.pattern != null) {
    fieldSchema = fieldSchema.regex(new RegExp(field.pattern), {
        message: 'Invalid format.',
    });
    }

    if (field.required !== true) fieldSchema = fieldSchema.optional();

    break;
```
