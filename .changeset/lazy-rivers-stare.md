---
"@bigcommerce/catalyst-core": minor
---

Add reCAPTCHA v2 support to storefront forms. The reCAPTCHA widget is rendered on the registration, contact, and product review forms when enabled in the BigCommerce admin. All validation and error handling is performed server-side in the corresponding form actions. The token is read from the native `g-recaptcha-response` field that the widget injects into the form, eliminating the need for manual token extraction on the client.

## Migration steps

### Step 1: Install dependencies

Add `react-google-recaptcha` and its type definitions:

```bash
pnpm add react-google-recaptcha
pnpm add -D @types/react-google-recaptcha
```

### Step 2: Add the reCAPTCHA server library

Create `core/lib/recaptcha/constants.ts`:

```ts
export interface ReCaptchaSettings {
  isEnabledOnStorefront: boolean;
  siteKey: string;
}

export const RECAPTCHA_TOKEN_FORM_KEY = "g-recaptcha-response";
```

Create `core/lib/recaptcha.ts` with the server-side helpers for fetching reCAPTCHA settings, extracting the token from form data, and asserting the token is present. See the file in this release for the full implementation.

### Step 3: Add reCAPTCHA translation strings

Update `core/messages/en.json` to add the `recaptchaRequired` message in each form namespace:

```diff
  "Auth": {
    "Register": {
+     "recaptchaRequired": "Please complete the reCAPTCHA verification.",
```

```diff
  "Product": {
    "Reviews": {
      "Form": {
+       "recaptchaRequired": "Please complete the reCAPTCHA verification.",
```

```diff
  "WebPages": {
    "ContactUs": {
      "Form": {
+       "recaptchaRequired": "Please complete the reCAPTCHA verification.",
```

```diff
  "Form": {
+   "recaptchaRequired": "Please complete the reCAPTCHA verification.",
```

### Step 4: Update GraphQL mutations to accept reCAPTCHA token

Update `core/app/[locale]/(default)/(auth)/register/_actions/register-customer.ts`:

```diff
+ import { assertRecaptchaTokenPresent, getRecaptchaFromForm } from '~/lib/recaptcha';
  ...
  const RegisterCustomerMutation = graphql(`
-   mutation RegisterCustomerMutation($input: RegisterCustomerInput!) {
+   mutation RegisterCustomerMutation(
+     $input: RegisterCustomerInput!
+     $reCaptchaV2: ReCaptchaV2Input
+   ) {
      customer {
-       registerCustomer(input: $input) {
+       registerCustomer(input: $input, reCaptchaV2: $reCaptchaV2) {
```

Update `core/app/[locale]/(default)/product/[slug]/_actions/submit-review.ts`:

```diff
+ import { assertRecaptchaTokenPresent, getRecaptchaFromForm } from '~/lib/recaptcha';
  ...
  const AddProductReviewMutation = graphql(`
-   mutation AddProductReviewMutation($input: AddProductReviewInput!) {
+   mutation AddProductReviewMutation(
+     $input: AddProductReviewInput!
+     $reCaptchaV2: ReCaptchaV2Input
+   ) {
      catalog {
-       addProductReview(input: $input) {
+       addProductReview(input: $input, reCaptchaV2: $reCaptchaV2) {
```

Update `core/app/[locale]/(default)/webpages/[id]/contact/_actions/submit-contact-form.ts`:

```diff
+ import { assertRecaptchaTokenPresent, getRecaptchaFromForm } from '~/lib/recaptcha';
  ...
  const SubmitContactUsMutation = graphql(`
-   mutation SubmitContactUsMutation($input: SubmitContactUsInput!) {
-     submitContactUs(input: $input) {
+   mutation SubmitContactUsMutation($input: SubmitContactUsInput!, $reCaptchaV2: ReCaptchaV2Input) {
+     submitContactUs(input: $input, reCaptchaV2: $reCaptchaV2) {
```

### Step 5: Add server-side reCAPTCHA validation to form actions

In each of the three server actions above, add the validation block after the `parseWithZod` check and pass the token to the GraphQL mutation. For example in `register-customer.ts`:

```diff
+   const { siteKey, token } = await getRecaptchaFromForm(formData);
+   const recaptchaValidation = assertRecaptchaTokenPresent(siteKey, token, t('recaptchaRequired'));
+
+   if (!recaptchaValidation.success) {
+     return {
+       lastResult: submission.reply({ formErrors: recaptchaValidation.formErrors }),
+     };
+   }
    ...
    const response = await client.fetch({
      document: RegisterCustomerMutation,
      variables: {
        input,
+       reCaptchaV2:
+         recaptchaValidation.token != null ? { token: recaptchaValidation.token } : undefined,
      },
```

Apply the same pattern to `submit-review.ts` and `submit-contact-form.ts`.

### Step 6: Pass `recaptchaSiteKey` to form components

Fetch the site key in each page and pass it down through the component tree.

Update `core/app/[locale]/(default)/(auth)/register/page.tsx`:

```diff
+ import { getRecaptchaSiteKey } from '~/lib/recaptcha';
  ...
+ const recaptchaSiteKey = await getRecaptchaSiteKey();
  ...
  <DynamicFormSection
+   recaptchaSiteKey={recaptchaSiteKey}
```

Update `core/app/[locale]/(default)/product/[slug]/page.tsx`:

```diff
+ import { getRecaptchaSiteKey } from '~/lib/recaptcha';
  ...
- const { product: baseProduct, settings } = await getProduct(productId, customerAccessToken);
+ const [{ product: baseProduct, settings }, recaptchaSiteKey] = await Promise.all([
+   getProduct(productId, customerAccessToken),
+   getRecaptchaSiteKey(),
+ ]);
  ...
  <ProductDetail
+   recaptchaSiteKey={recaptchaSiteKey}
  ...
  <Reviews
+   recaptchaSiteKey={recaptchaSiteKey}
```

Update `core/app/[locale]/(default)/webpages/[id]/contact/page.tsx`:

```diff
+ import { getRecaptchaSiteKey } from '~/lib/recaptcha';
  ...
+ const recaptchaSiteKey = await getRecaptchaSiteKey();
  ...
  <DynamicForm
+   recaptchaSiteKey={recaptchaSiteKey}
```

### Step 7: Render the reCAPTCHA widget in form components

Update `core/vibes/soul/form/dynamic-form/index.tsx`:

```diff
+ import RecaptchaWidget from 'react-google-recaptcha';
  ...
  export interface DynamicFormProps<F extends Field> {
+   recaptchaSiteKey?: string;
  }
  ...
+         {recaptchaSiteKey ? <RecaptchaWidget sitekey={recaptchaSiteKey} /> : null}
```

Update `core/vibes/soul/sections/reviews/review-form.tsx`:

```diff
+ import RecaptchaWidget from 'react-google-recaptcha';
  ...
  interface Props {
+   recaptchaSiteKey?: string;
  }
  ...
+           {recaptchaSiteKey ? (
+             <div>
+               <RecaptchaWidget sitekey={recaptchaSiteKey} />
+             </div>
+           ) : null}
```

### Step 8: Thread `recaptchaSiteKey` through intermediate components

Add the `recaptchaSiteKey?: string` prop and pass it through in:

- `core/vibes/soul/sections/dynamic-form-section/index.tsx`
- `core/vibes/soul/sections/product-detail/index.tsx`
- `core/vibes/soul/sections/reviews/index.tsx`
- `core/app/[locale]/(default)/product/[slug]/_components/reviews.tsx`

Each of these accepts the prop and forwards it to the form component that renders the widget.
