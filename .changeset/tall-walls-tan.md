---
"@bigcommerce/catalyst-core": patch
---

Implement functional newsletter subscription feature with BigCommerce GraphQL API integration.

## What Changed

- Replaced the mock implementation in `subscribe.ts` with a real BigCommerce GraphQL API call using the `SubscribeToNewsletterMutation`.
- Added comprehensive error handling for invalid emails, already-subscribed users, and unexpected errors.
- Improved form error handling in `InlineEmailForm` to use `form.errors` instead of field-level errors for better error display.
- Added comprehensive E2E tests and test fixtures for subscription functionality.

## Migration Guide

Replace the `subscribe` action in `core/components/subscribe/_actions/subscribe.ts` with the latest changes to include:
- BigCommerce GraphQL mutation for newsletter subscription
- Error handling for invalid emails, already-subscribed users, and unexpected errors
- Proper error messages returned via Conform's `submission.reply()`

Update `inline-email-form` to fix issue of not showing server-side error messages from form actions.

**`core/vibes/soul/primitives/inline-email-form/index.tsx`**

1. Add import for `FieldError` component:
```tsx
import { FieldError } from '@/vibes/soul/form/field-error';
```

2. Remove the field errors extraction:
```tsx
// Remove: const { errors = [] } = fields.email;
```

3. Update border styling to check both form and field errors:
```tsx
// Changed from:
errors.length ? 'border-error' : 'border-black',

// Changed to:
form.errors?.length || fields.email.errors?.length
  ? 'border-error focus-within:border-error'
  : 'border-black focus-within:border-primary',
```

4. Update error rendering to display both field-level and form-level errors:
```tsx
// Changed from:
{errors.map((error, index) => (
  <FormStatus key={index} type="error">
    {error}
  </FormStatus>
))}

// Changed to:
{fields.email.errors?.map((error) => (
  <FieldError key={error}>{error}</FieldError>
))}
{form.errors?.map((error, index) => (
  <FormStatus key={index} type="error">
    {error}
  </FormStatus>
))}
```

This change ensures that server-side error messages returned from form actions (like `formErrors` from Conform's `submission.reply()`) are now properly displayed to users.

Add the following translation keys to your locale files (e.g., `messages/en.json`):
```json
{
  "Components": {
    "Subscribe": {
      "title": "Sign up for our newsletter",
      "placeholder": "Enter your email",
      "description": "Stay up to date with the latest news and offers from our store.",
      "subscribedToNewsletter": "You have been subscribed to our newsletter.",
      "Errors": {
        "invalidEmail": "Please enter a valid email address.",
        "somethingWentWrong": "Something went wrong. Please try again later."
      }
    }
  }
}
```
