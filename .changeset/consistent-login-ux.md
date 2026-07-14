---
"@bigcommerce/catalyst": patch
---

Unify the device-code login UX across `auth login`, `create`, and the channel commands. The CLI now waits for you to press Enter before opening the browser and best-effort copies the one-time code to your clipboard so you can paste it directly (the code is still printed as a fallback). Non-interactive/CI runs skip the prompt and open directly.
