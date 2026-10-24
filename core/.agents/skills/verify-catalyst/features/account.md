# Account

Shoppers log in, register a new account through a form driven by the store's customer and address fields, and manage their orders, addresses, wishlists, and settings once signed in.

## Sub-features

- `account-login` logs in with email and password and lands in the account area.
- `account-register` renders the store-configured registration form and creates a customer.
- `account-register-state` shows State/Province only when the selected country has states.
- `account-forgot-password` requests a reset email.
- `account-area` covers orders, addresses, wishlists, and settings for signed-in shoppers.

## How to get to it (user POV)

- Choose the `Profile` link in the header. Signed-out shoppers land on `/login`.
- On `/login`, choose `Create account` to reach `/register`.
- Visit `/login`, `/register`, or `/account/orders` directly. Signed-out shoppers are redirected to log in.

## Driving it with verify.mjs

Preconditions:

- Log-in and account-area journeys need `env.TEST_CUSTOMER_EMAIL` and `env.TEST_CUSTOMER_PASSWORD` from `.env.test.local`.
- Registration journeys stay read-only: fill in the form and assert the visible behavior, but do not choose `Create account` unless the store is a sandbox.
- Fill registration and address forms with synthetic values only (`Test Shopper`, `test@example.com`, a made-up address). The recording captures every keystroke, so never type the developer's own details.

- **Log in.** `page.goto('/login')`, fill `textbox` `Email` and `textbox` `Password`, then choose `button` `Log in`. The URL moves under `/account`.
- **Registration form.** `page.goto('/register')`. The `heading` level 1 reads `New account`, followed by text fields (`First Name`, `Last Name`, `Email Address`, `Password`, `Confirm Password`, address fields) and a `combobox` `Country`.
- **Choose a country.** Choose the `combobox` `Country`, then the `option` by name, for example `page.getByRole('option', { name: 'United States' })`. The list is long; typing the first letters narrows it.
- **State/Province follows the country.** With a country that has states, the `State/Province` field is present. With a country that has none, the field is absent: assert `toHaveCount(0)` on `page.getByLabel('State/Province', { exact: true })`. Switching back brings it back. Confirm the switch landed first (`expect(country).toContainText('Algeria')`) so an absent field is not a race. The field sits beside `Country`, so the step screenshot (scrolled to the focused combobox) shows both.
- **Validation.** Choose `Create account` with empty required fields. Inline errors appear and no request leaves the form. This is safe because nothing is submitted.

## Gotchas

- Countries without states come from the store's own country data. Algeria (`DZ`) has none in BigCommerce defaults, but a store can add states to any country, so confirm visually before asserting.
- With no country chosen, the field shows as a text input labeled `State/Province`; for countries with states it can render as a dropdown. Match it by label, not by role.
- Registration fields are configurable per store (extra customer and address fields, required flags). Never assume the stock field list.
- reCAPTCHA, when enabled on the store, blocks automated submission. Verify up to the submit button.
- Logging in sets a session cookie for the rest of the journey's context; log-out lives at `/logout`.
