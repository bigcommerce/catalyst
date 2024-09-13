---
"@bigcommerce/catalyst-core": minor
---
If app is not running on Vercel's infra, `<Analytics />` and `<SpeedInsights />` are not rendered.

Opt-out of vercel analytics and speed insights by setting the following env vars to `true`

- `DISABLE_VERCEL_ANALYTICS`
- `DISABLE_VERCEL_SPEED_INSIGHTS`
