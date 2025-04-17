---
"@bigcommerce/catalyst-core": patch
---

Adds `Streamable.from` and uses it wherever we were unintentionally executing an async function in a React Server Component.
