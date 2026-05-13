---
"@bigcommerce/catalyst-makeswift": patch
---

Bump Next.js and React to address security vulnerabilities

- `next`: ~16.1.6 → ~16.2.6 — fixes middleware bypass, SSRF, XSS, and cache poisoning CVEs
- `react` / `react-dom`: 19.1.5 → 19.1.7 — fixes GHSA-rv78-f8rc-xrxh (DoS via OOM/CPU exhaustion on server function endpoints)
