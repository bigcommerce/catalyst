---
"@bigcommerce/catalyst-core": patch
---

Update /login/token route error handling and messaging

## Migration steps

### 1. Add `invalidToken` translation key to the `Auth.Login` namespace:
```json
"invalidToken": "Your login link is invalid or has expired. Please try logging in again.",
```

### 2. In `core/app/[locale]/(default)/(auth)/login/token/[token]/route.ts`, add a `console.error` in the `catch` block to log the error details:
```typescript
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);

  // ...
}
```

### 3. In `core/app/[locale]/(default)/(auth)/login/page.tsx`, add `error` prop to searchParams and pass it down into the `SignInSection` component:
```typescript
export default async function Login({ params, searchParams }: Props) {
  const { locale } = await params;
  const { redirectTo = '/account/orders', error } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Login');
  const vanityUrl = buildConfig.get('urls').vanityUrl;
  const redirectUrl = new URL(redirectTo, vanityUrl);
  const redirectTarget = redirectUrl.pathname + redirectUrl.search;
  const tokenErrorMessage = error === 'InvalidToken' ? t('invalidToken') : undefined;

  return (
    <>
      <ForceRefresh />
      <SignInSection
        action={login.bind(null, { redirectTo: redirectTarget })}
        emailLabel={t('email')}
        error={tokenErrorMessage}
        ...
```


### 4. Update `core/vibes/soul/sections/sign-in-section/index.tsx` and add the `error` prop, and pass it down to `SignInForm`:
```typescript
interface Props {
  // ... existing props
  error?: string;
}

// ...

export function SignInSection({
  // ... existing variables
  error,
}: Props) {
  // ...
  <SignInForm
    action={action}
    emailLabel={emailLabel}
    error={error}
```

### 5. Update `core/vibes/soul/sections/sign-in-section/sign-in-form.tsx` to take the error prop and display it in the form errors:

```typescript
interface Props {
  // ... existing props
  error?: string;
}

export function SignInForm({
  // ... existing variables
  error,
}: Props) {
  // ...
  useEffect(() => {
    // If the form errors change when an "error" search param is in the URL,
    // the search param should be removed to prevent showing stale errors.
    if (form.errors) {
      const url = new URL(window.location.href);

      if (url.searchParams.has('error')) {
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [form.errors]);

  const formErrors = () => {
    // Form errors should take precedence over the error prop that is passed in.
    // This ensures that the most recent errors are displayed to avoid confusion.
    if (form.errors) {
      return form.errors;
    }

    if (error) {
      return [error];
    }

    return [];
  };

  return (
    <form {...getFormProps(form)} action={formAction} className="flex grow flex-col gap-5">
      // ...
      <SubmitButton>{submitLabel}</SubmitButton>
      {formErrors().map((err, index) => (
        <FormStatus key={index} type="error">
          {err}
        </FormStatus>
      ))}
    </form>
  );
}
```

### 6. Copy all changes in the `core/tests` directory
