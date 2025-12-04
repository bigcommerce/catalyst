---
"@bigcommerce/catalyst-core": patch
---

Improved login error handling to display a custom error message when BigCommerce indicates a password reset is required, instead of showing a generic error message.

## What's Fixed

When attempting to log in with an account that requires a password reset, users now see an informative error message: "Password reset required. Please check your email for instructions to reset your password."

**Before**: Generic "something went wrong" error message  
**After**: Clear error message explaining the password reset requirement

## Migration

### Step 1: Update Translation Files

Add this translation key to your locale files (e.g., `core/messages/en.json`):

```json
{
  "Auth": {
    "Login": {
      "passwordResetRequired": "Password reset required. Please check your email for instructions to reset your password.",
    }
  }
}
```

Repeat for all supported locales if you maintain custom translations.

### Step 2: Update Login Server Action

In your login server action (e.g., `core/app/[locale]/(default)/(auth)/login/_actions/login.ts`):

Add the password reset error handling block:
```typescript
if (
  error instanceof AuthError &&
  error.type === 'CallbackRouteError' &&
  error.cause &&
  error.cause.err instanceof BigCommerceGQLError &&
  error.cause.err.message.includes('Reset password"')
) {
  return submission.reply({ formErrors: [t('passwordResetRequired')] });
}
```

This should be placed in your error handling, before the generic "Invalid credentials" check.
