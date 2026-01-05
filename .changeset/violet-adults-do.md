---
"@bigcommerce/catalyst-core": minor
---

Add newsletter subscription toggle to account settings page, allowing customers to manage their marketing preferences directly from their account.

## What Changed

- Added `NewsletterSubscriptionForm` component with a toggle switch for subscribing/unsubscribing to newsletters
- Created `updateNewsletterSubscription` server action that handles both subscribe and unsubscribe operations via BigCommerce GraphQL API
- Updated `AccountSettingsSection` to conditionally display the newsletter subscription form when enabled
- Enhanced `CustomerSettingsQuery` to fetch `isSubscribedToNewsletter` status and `showNewsletterSignup` store setting
- Updated account settings page to pass newsletter subscription props and bind customer info to the action
- Added translation keys for newsletter subscription UI in `Account.Settings.NewsletterSubscription` namespace
- Added E2E tests for subscribing and unsubscribing functionality

## Migration Guide

To add the newsletter subscription toggle to your account settings page:

### Step 1: Copy the server action

Copy the new server action file to your account settings directory:

```bash
cp core/app/[locale]/(default)/account/settings/_actions/update-newsletter-subscription.ts \
   your-app/app/[locale]/(default)/account/settings/_actions/update-newsletter-subscription.ts
```

### Step 2: Update the GraphQL query

Update `core/app/[locale]/(default)/account/settings/page-data.tsx` to include newsletter subscription fields:

```tsx
// Renamed CustomerSettingsQuery to AccountSettingsQuery
const AccountSettingsQuery = graphql(`
  query AccountSettingsQuery(...) {
    customer {
      ...
      isSubscribedToNewsletter  # Add this field
    }
    site {
      settings {
        ...
        newsletter {            # Add this section
          showNewsletterSignup
        }
      }
    }
  }
`);
```

Also update the return statement to include `newsletterSettings`:

```tsx
const newsletterSettings = response.data.site.settings?.newsletter;

return {
  ...
  newsletterSettings,  // Add this
};
```

### Step 3: Copy the NewsletterSubscriptionForm component

Copy the new form component:

```bash
cp core/vibes/soul/sections/account-settings/newsletter-subscription-form.tsx \
   your-app/vibes/soul/sections/account-settings/newsletter-subscription-form.tsx
```

### Step 4: Update AccountSettingsSection

Update `core/vibes/soul/sections/account-settings/index.tsx`:

1. Import the new component:
```tsx
import {
  NewsletterSubscriptionForm,
  UpdateNewsletterSubscriptionAction,
} from './newsletter-subscription-form';
```

2. Add props to the interface:
```tsx
export interface AccountSettingsSectionProps {
  ...
  newsletterSubscriptionEnabled?: boolean;
  isAccountSubscribed?: boolean;
  newsletterSubscriptionTitle?: string;
  newsletterSubscriptionLabel?: string;
  newsletterSubscriptionCtaLabel?: string;
  updateNewsletterSubscriptionAction?: UpdateNewsletterSubscriptionAction;
}
```

3. Add the form section in the component (after the change password form):
```tsx
{newsletterSubscriptionEnabled && updateNewsletterSubscriptionAction && (
  <div className="border-t border-[var(--account-settings-section-border,hsl(var(--contrast-100)))] pt-12">
    <h1 className="mb-10 font-[family-name:var(--account-settings-section-font-family,var(--font-family-heading))] text-2xl font-medium leading-none text-[var(--account-settings-section-text,var(--foreground))] @xl:text-2xl">
      {newsletterSubscriptionTitle}
    </h1>
    <NewsletterSubscriptionForm
      action={updateNewsletterSubscriptionAction}
      ctaLabel={newsletterSubscriptionCtaLabel}
      isAccountSubscribed={isAccountSubscribed}
      label={newsletterSubscriptionLabel}
    />
  </div>
)}
```

### Step 5: Update the account settings page

Update `core/app/[locale]/(default)/account/settings/page.tsx`:

1. Import the action:
```tsx
import { updateNewsletterSubscription } from './_actions/update-newsletter-subscription';
```

2. Extract newsletter settings from the query:
```tsx
const newsletterSubscriptionEnabled = accountSettings.storeSettings?.showNewsletterSignup;
const isAccountSubscribed = accountSettings.customerInfo.isSubscribedToNewsletter;
```

3. Bind customer info to the action:
```tsx
const updateNewsletterSubscriptionActionWithCustomerInfo = updateNewsletterSubscription.bind(
  null,
  {
    customerInfo: accountSettings.customerInfo,
  },
);
```

4. Pass props to `AccountSettingsSection`:
```tsx
<AccountSettingsSection
  ...
  isAccountSubscribed={isAccountSubscribed}
  newsletterSubscriptionCtaLabel={t('cta')}
  newsletterSubscriptionEnabled={newsletterSubscriptionEnabled}
  newsletterSubscriptionLabel={t('NewsletterSubscription.label')}
  newsletterSubscriptionTitle={t('NewsletterSubscription.title')}
  updateNewsletterSubscriptionAction={updateNewsletterSubscriptionActionWithCustomerInfo}
/>
```

### Step 6: Add translation keys

Add the following keys to your locale files (e.g., `messages/en.json`):

```json
{
  "Account": {
    "Settings": {
      ...
      "NewsletterSubscription": {
        "title": "Marketing preferences",
        "label": "Opt-in to receive emails about new products and promotions.",
        "marketingPreferencesUpdated": "Marketing preferences have been updated successfully!",
        "somethingWentWrong": "Something went wrong. Please try again later."
      }
    }
  }
}
```

### Step 7: Verify the feature

1. Ensure your BigCommerce store has newsletter signup enabled in store settings
2. Navigate to `/account/settings` as a logged-in customer
3. Verify the newsletter subscription toggle appears below the change password form
4. Test subscribing and unsubscribing functionality

The newsletter subscription form will only display if `newsletterSubscriptionEnabled` is `true` (controlled by the `showNewsletterSignup` store setting).
