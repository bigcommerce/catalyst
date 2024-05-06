---
"@bigcommerce/catalyst-core": minor
---

Added a default sample rate of 25% for both Vercel Speed Insights and Vercel Analytics. This provides a good jumping off point for merchants to tweak their sample rates if they choose to.

In order to tweak the sample rate, you can add the following environment variables to your Vercel project:
- `NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE` for Vercel Analytics
- `NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE` for Vercel Speed Insights
