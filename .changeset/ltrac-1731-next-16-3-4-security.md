---
"@bigcommerce/catalyst-core": patch
---

Upgrade Next.js from 16.2.11 to 16.3.4.

16.3.3 patches two critical advisories: unauthenticated remote code execution on Windows-hosted servers ([GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36)) and unauthenticated remote code execution in the Image Optimization API when AVIF files are used ([GHSA-2xp9-vwfh-vxw4](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)). 16.3.4 re-enables AVIF image optimization after that fix.

Also picked up are backported fixes for optimistic-routing bugs that caused repeated prefetch loops, a Nav Inspector request loop on repeat captures, and cache-entry reuse that discards only entries predating a tag revalidation rather than all of them.
