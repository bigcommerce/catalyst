---
"@bigcommerce/catalyst-core": patch
---

Add toast message when changing password

## Migration

### `core/vibes/soul/sections/account-settings/change-password-form.tsx`

1. Import `toast`:

```ts
import { toast } from '@/vibes/soul/primitives/toaster';
```

2. Update the `ChangePasswordAction` types:

```ts
type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export type ChangePasswordAction = Action<State, FormData>;
```

3. Update the `useActionState` hook:

```ts
const [state, formAction] = useActionState(action, { lastResult: null });
```

4. Update the `useEffect` hook to display a toast message on success:

```ts
  useEffect(() => {
    if (state.lastResult?.status === 'success' && state.successMessage != null) {
      toast.success(state.successMessage);
    }

    if (state.lastResult?.error) {
      // eslint-disable-next-line no-console
      console.log(state.lastResult.error);
    }
  }, [state]);
```

### `core/app/[locale]/(default)/account/settings/_actions/change-password.ts`

Update all of the `return` values to match the new `ChangePasswordAction` interface, and return the `passwordUpdated` message on success.

```ts

export const changePassword: ChangePasswordAction = async (prevState, formData) => {
  const t = await getTranslations('Account.Settings');
  const customerAccessToken = await getSessionCustomerAccessToken();

  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  const input = {
    currentPassword: submission.value.currentPassword,
    newPassword: submission.value.password,
  };

  try {
    const response = await client.fetch({
      document: CustomerChangePasswordMutation,
      variables: {
        input,
      },
      customerAccessToken,
    });

    const result = response.data.customer.changePassword;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    return {
      lastResult: submission.reply(),
      successMessage: t('passwordUpdated'),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
      };
    }

    return { lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }) };
  }
};
```
